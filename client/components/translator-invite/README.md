# Translator invite

This component invites users to translate WordPress.com into a non-default locale based on a locale:

1. currently set as the UI locale
2. in the url
3. in their browser preferences.

If a locale is found, the component fetches the localized name of the language.

## Usage

```javascript
<TranslatorInvite path={ path } />;
```

## Props

- `path`: {string} (optional) Current path
