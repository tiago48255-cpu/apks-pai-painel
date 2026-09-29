package com.rcservicos.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.net.Uri;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import android.Manifest;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 101;
    private static final int BACKUP_SAVE_REQUEST = 102;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingBackup;
    @Override public void onCreate(Bundle b){ super.onCreate(b);
        web=new WebView(this); setContentView(web);
        WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true); s.setAllowContentAccess(true); s.setMediaPlaybackRequiresUserGesture(false); s.setBuiltInZoomControls(false);
        web.setWebViewClient(new WebViewClient(){ @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){
            String scheme = r.getUrl().getScheme();
            if ("file".equals(scheme) || "about".equals(scheme)) return false;
            try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception ignored) { }
            return true;
        } });
        web.addJavascriptInterface(new BackupBridge(), "RCAndroid");
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = params.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                try { startActivityForResult(intent, FILE_CHOOSER_REQUEST); return true; }
                catch (Exception error) { fileCallback = null; return false; }
            }
            @Override public void onPermissionRequest(final PermissionRequest req) {
                runOnUiThread(() -> {
                    if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        for (String resource : req.getResources()) {
                            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                                req.grant(new String[]{resource});
                                return;
                            }
                        }
                    }
                    req.deny();
                });
            }
        });
        if(android.os.Build.VERSION.SDK_INT>=23 && checkSelfPermission(Manifest.permission.CAMERA)!=PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{Manifest.permission.CAMERA}, 10);
        web.loadUrl("file:///android_asset/index.html");
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == BACKUP_SAVE_REQUEST) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingBackup != null) {
                try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                    if (output == null) throw new Exception("Arquivo indisponível");
                    output.write(pendingBackup.getBytes(StandardCharsets.UTF_8));
                    Toast.makeText(this, "Backup salvo", Toast.LENGTH_LONG).show();
                } catch (Exception error) {
                    Toast.makeText(this, "Falha ao salvar backup: " + error.getMessage(), Toast.LENGTH_LONG).show();
                }
            }
            pendingBackup = null;
            return;
        }
        if (requestCode != FILE_CHOOSER_REQUEST || fileCallback == null) return;
        fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
        fileCallback = null;
    }
    private class BackupBridge {
        @JavascriptInterface public void saveBackup(String json, String filename) {
            runOnUiThread(() -> {
                pendingBackup = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, filename);
                startActivityForResult(intent, BACKUP_SAVE_REQUEST);
            });
        }
    }
    @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
