Translator invite
==========

This component invites users to translate WordPress.com into a non-default locale based on a locale:

1. passed down as a prop
2. in the url
3. in their browser preferences.

If a locale is found, the component fetches the localized name of the language.

#### Usage:

```javascript
	<TranslatorInvite locale={ locale } path={ path } />
```

#### Props

* `locale`: {String} (optional) A WordPress.com locale that takes priority over other locales
* `path`: {String} (optional) Current path
