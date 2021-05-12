# I18n Utils

I18n-related utilities for use by client, server, apps, and packages.

## Usage

```js
import { localizeUrl } from '@automattic/i18n-utils';
```

## Setting up the locale slug

In order to make some i18n utils work in React you need to supply a locale
slug to `<LocaleProvider>` somewhere high up in your react tree. How you
get this locale slug will depend on the app `@automattic/i18n-utils` is
being used in.

```js
import { LocaleProvider } from '@automattic/i18n-utils';

function renderApp() {
	return (
		<LocaleProvider localeSlug="en">
			<div>... your app components go here ...</div>
		</LocaleProvider>
	);
}
```

Once a `<LocaleProvider>` is available near the root of your tree the
`useLocale()` hook can be used in your components.
