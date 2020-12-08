# App Instance

Provides a small wrapper around Electron's `app.requestSingleInstanceLock`.

When a duplicate app instance is detected it will:

- Quit the second app
- Bring the original app to the foreground

Note: Care should be taken if building for the Mac App Store, as the previous (deprecated) makeSingleInstance API would crash the function due to sandboxing. The updated requestSingleInstanceLock API may behave similarly.
