@wordpress/i18n
======

Internationalization utilities for client-side localization.

https://codex.wordpress.org/I18n_for_WordPress_Developers


## Installation

Install the module:

```bash
npm install @wordpress/i18n --save
```

```js
import { sprintf, _n } from '@wordpress/i18n';

sprintf( _n( '%d hat', '%d hats', 4, 'text-domain' ), 4 );
// 4 hats
```

Note that you will not need to specify [domain](https://codex.wordpress.org/I18n_for_WordPress_Developers#Text_Domains) for the strings.

## Build

You can use the [WordPress i18n babel plugin](../babel-plugin-makepot/README.md) to generate a `.pot` file containing all your localized strings.

The package also includes a `pot-to-php` script used to generate a php files containing the messages listed in a `.pot` file. This is useful to trick WordPress.org translation strings discovery since at the moment, WordPress.org is not capable of parsing strings directly from JavaScript files.

```sh
npx pot-to-php languages/myplugin.pot languages/myplugin-translations.php text-domain
```

## API

`__( text: string, domain: string ): string`

Retrieve the translation of text.

See: https://developer.wordpress.org/reference/functions/__/

`_x( text: string, context: string, domain: string ): string`

Retrieve translated string with gettext context.

See: https://developer.wordpress.org/reference/functions/_x/

`_n( single: string, plural: string, number: Number, domain: string ): string`

Translates and retrieves the singular or plural form based on the supplied number.

See: https://developer.wordpress.org/reference/functions/_n/

`_nx( single: string, plural: string, number: Number, context: string, domain: string ): string`

Translates and retrieves the singular or plural form based on the supplied number, with gettext context.

See: https://developer.wordpress.org/reference/functions/_nx/

`sprintf( format: string, ...args: mixed[] ): string`

Returns a formatted string.

See: http://www.diveintojavascript.com/projects/javascript-sprintf

`setLocaleData( data: Object, domain: string )`

Creates a new Jed instance with specified locale data configuration.

`getI18n(): Jed`

Returns the current Jed instance, initializing with a default configuration if not already assigned.

See: http://messageformat.github.io/Jed/

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
