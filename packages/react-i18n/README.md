# React I18n

React bindings to [`@wordpress/i18n`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/i18n).

## Installation

Install the module:

```sh
npm install @automattic/react-i18n
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods. Learn more about it in [Babel docs](https://babeljs.io/docs/en/next/caveats)._

## Usage

### I18nProvider

An `I18nProvider` should be mounted above any localized components:

```js
import { I18nProvider } from '@automattic/react-i18n';

<I18nProvider
	localeData={
		{
			/* Localed data object */
		}
	}
>
	<MyLocalizedApp />
</I18nProvider>;
```

### Hook

Access i18n functions through the `useI18n()` hook:

```js
import { useI18n } from '@automattic/react-i18n';

function MyComponent() {
	const { __ } = useI18n();
	return __( 'Hello, world!' );
}
```

### Higher-Order Component (HOC)

The `withI18n` function will transform your component to include i18n functions as props:

```js
import { Component } from '@wordpress/element';
import { withI18n } from '@automattic/react-i18n';

class MyComponent extends Component {
	render() {
		return this.props.__( 'Hello, world!' );
	}
}

export default withI18n( MyComponent );
```

## API

### Translation Functions

`__`, `_n`, `_nx`, and `_x` are exposed from [`@wordpress/i18n`](https://github.com/WordPress/gutenberg/tree/HEAD/packages/i18n). Refer to their documentation there.

### localeData

Locale data in Jed-formatted JSON object, that is used by the active Tannin instance.

### hasTranslation

A helper function that can be used to determine if translation entry exists in the locale data. It is based on a similar logic as Tannin's translations lookup.

_Parameters_

- _text_ `string`: Text to lookup for.
- _context_ `[string]`: Context information for the translators.

_Returns_

- `boolean`: Whether translation entry exists in locale data.

```js
hasTranslation( 'post', 'verb' );
```

### Filter Functions

`addFilter` and `removeFilter` are based on [`@wordpress/hooks`](https://developer.wordpress.org/block-editor/packages/packages-hooks/). Refer to their documentation there.

#### Available Filters

##### preTranslation

Modify the input arguments before the translation lookup.

_Parameters_

- _args_ `array`: The arguments array passed to the translate function.
- _fnName_ `string`: The name of the translation function. Could be `__`, `_n`, `_nx`, or `_x`.
- _filters_ `object`: `@automattic/react-i18n` context filters object.

##### postTranslation

Modify the result of the translate function.

_Parameters_

- _translation_ `string`: The retrieved translation string.
- _args_ `array`: The input arguments array passed to the translate function.
- _fnName_ `string`: The name of the translation function. Could be `__`, `_n`, `_nx`, or `_x`.
- _filters_ `object`: `@automattic/react-i18n` context filters object.
