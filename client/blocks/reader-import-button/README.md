# Reader Import Button

Allows a Reader user to import their subscriptions in OPML or XML format.

## Props

| Prop | Type | Required | Description |
|-----|:----:|:--------:|-------------|
| `onError`| Function | No | Function to execute in the case of an import error |
| `onImport`| Function | No | Function to execute in the case of successful import |
| `onProgress`| Function | No | Function to execute when the upload is in progress |