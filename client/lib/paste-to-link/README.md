# Paste-to-Link

Paste-to-Link is a higher-order component (HOC) that adds special paste behaviour to the wrapped component.

If the clipboard contains a URL and some text is selected, pasting will wrap the selected text in an
<a> element with the href set to the URL in the clipboard.

For example, type and highlight "WordPress" with "<http://wordpress.com>" in your clipboard and then paste.
The textarea will then contain:

<a href="http://wordpress.com">WordPress</a>

## Usage

Wrap your component like this:

```
export default withPasteToLink( WrappedComponent );
```

This HOC is enabled by default for the main comments form in `blocks/comments`.
