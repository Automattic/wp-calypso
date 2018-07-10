BrowserURL
==========

`<BrowserURL />` is a component used to keep the editor's saved post ID in sync with the browser's URL. Using the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API), it makes an in-place replacement (using `window.replaceState`) of the URL if the post ID changes and is not an auto-draft.
