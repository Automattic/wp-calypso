# I18n Calypso

This lib enables translations, exposing two public methods:

- [.translate()](#translate-method)
- [.numberFormat()](#numberformat-method)

It also provides a React higher-order component named [localize()](#localize) and a React hook name [useTranslate()](#react-hook). Wrapping your component in `localize()` will give it the aforementioned functions as props, and calling the `useTranslate()` hook will return the `translate()` function. This is the suggested way of using `i18n-calypso` methods with React components.

Finally, this lib exposes a utility method for your React application:

- [.hasTranslation()](#hastranslation-method)

## Translate Method

`translate()` accepts up to three arguments (`string`, `string`, `object`), depending on the translation needs. The second and/or third parameter can be omitted:

```
/**
 * @param {string} original  - the string to translate, will be used as single version if plural passed
 * @param {string} [plural]  - the plural string to translate (if applicable)
 * @param {object} [options] - properties describing translation requirements for given text
 **/
```

### Options

The following attributes can be set in the options object to alter the translation type. The attributes can be combined as needed for a particular case.

- **options.args** [string, array, or object] arguments you would pass into sprintf to be run against the text for string substitution. [See docs](https://www.npmjs.com/package/@tannin/sprintf#readme)
- **options.components** [object] markup must be added as React components and not with string substitution. See [mixing strings and markup](#mixing-strings-and-markup).
- **options.comment** [string] comment that will be shown to the translator for anything that may need to be explained about the translation.
- **options.context** [string] provides the ability for the translator to provide a different translation for the same text in two locations (_dependent on context_). Usually context should only be used after a string has been discovered to require different translations. If you want to provide help on how to translate (which is highly appreciated!), please use a comment.

### Usage

If you pass a single string into `translate`, it will trigger a simple translation without any context, pluralization, sprintf arguments, or comments. You would call it like this.

```js
const i18n = require( 'i18n-calypso' );
const translation = i18n.translate( 'Some content to translate' );
```

### Strings Only

Translation strings are extracted from our codebase through a process of [static analysis](http://en.wikipedia.org/wiki/Static_program_analysis) and imported into GlotPress where they are translated ([more on that process here](./cli)). So you must avoid passing a variable, ternary expression, function call, or other form of logic in place of a string value to the `translate` method. The _one_ exception is that you can split a long string into multiple substrings concatenated with the `+` operator.

GlotPress also support emoji being part of the translatable string, as it allows flexibility with positioning when being translated.

```js
/*----------------- Bad Examples -----------------*/

// don't pass a logical expression argument
const translation1 = i18n.translate( condition ? 'foo' : 'bar' );

// don't pass a variable argument
const translation2 = i18n.translate( foo );

// don't pass a function call argument
const translation3 = i18n.translate( foo( 'bar' ) );

/*----------------- Good Examples -----------------*/

// do pass a string argument
const example = i18n.translate( 'foo' );

// do concatenate long strings with the + operator
const translation4 = i18n.translate(
	'I am the very model of a modern Major-General, ' +
		"I've information vegetable, animal, and mineral, " +
		'I know the kings of England, and I quote the fights historical ' +
		'from Marathon to Waterloo, in order categorical.'
);

const emoji = i18n.translate( 'Let us celebrate 🎉');
```

### String Substitution

The `translate()` method uses sprintf interpolation for string substitution ([see docs for syntax details](https://www.npmjs.com/package/@tannin/sprintf#readme)). The `option.args` value is used to inject variable content into the string.

```js
// named arguments (preferred approach)
i18n.translate( 'My %(thing)s has %(number)d corners', {
	args: {
		thing: 'hat',
		number: 3,
	},
} );
// 'My hat has 3 corners'

// argument array
i18n.translate( 'My %s has %d corners', {
	args: [ 'hat', 3 ],
} );
// 'My hat has 3 corners'

// single substitution
i18n.translate( 'My %s has 3 corners', {
	args: 'hat',
} );
// 'My hat has 3 corners'
```

### Mixing Strings And Markup

Because React tracks DOM nodes in the virtual DOM for rendering purposes, you cannot use string substitution with html markup as you might in a php scenario, because we don't render arbitrary html into the page, we are creating a virtual DOM in React.

Instead we use the [`@automattic/interpolate-components` package](../interpolate-components) to inject components into the string using a component token as a placeholder in the string and a components object, similar to how string substitution works. The result of the `translate()` method can then be inserted as a child into another React component. Component tokens are strings (containing letters, numbers, or underscores only) wrapped inside double-curly braces and have an opening, closing, and self-closing syntax, similar to html.

**NOTE: Always use a JSX element for passing components. Otherwise you will need to [wrap your React classes with `createFactory`](http://facebook.github.io/react/blog/2014/10/14/introducing-react-elements.html). Any wrapped content inside opening/closing component tokens will be inserted/replaced as the children of that component in the output. Component tokens must be unique:**

```js
// self-closing component syntax
const example = i18n.translate( 'My hat has {{hatInput/}} corners', {
	components: {
		hatInput: <input name="hatInput" type="text" />,
	},
} );

// component that wraps part of the string
const example2 = i18n.translate( 'I feel {{em}}very{{/em}} strongly about this.', {
	components: {
		em: <em />,
	},
} );

// components can nest
const example3 = i18n.translate( '{{a}}{{icon/}}click {{em}}here{{/em}}{{/a}} to see examples.', {
	components: {
		a: <a href="http://example.com" />,
		em: <em />,
		icon: <Icon size="huge" />,
	},
} );
```

### Pluralization

You must specify both the singular and plural variants of a string when it contains plurals. If the string uses placeholders that will be replaced with actual values, then both the plural and singular strings should include those placeholders. It might seem redundant, but it is necessary for languages where a singular version may be used for counts other than 1.

```js
// An example where the translated string does not have
// a number represented directly, but still depends on it
const numHats = howManyHats(); // returns integer
const contentHats = i18n.translate( 'My hat has three corners.', 'My hats have three corners.', {
	count: numHats,
} );

// An example where the translated string includes the actual number it depends on
const numDays = daysUntilExpiration(); // returns integer
const contentDays = i18n.translate(
	'Your subscription will expire in %(numberOfDays)d day.',
	'Your subscription will expire in %(numberOfDays)d days.',
	{
		count: numDays,
		args: {
			numberOfDays: numDays,
		},
	}
);
```

### More translate() Examples

```js
// simplest case... just a translation, no special options
const content1 = i18n.translate( 'My hat has three corners.' );

// sprintf-style string substitution
const city = getCity(); // returns string
const zip = getZip(); // returns string
const content = i18n.translate( 'Your city is %(city)s, your zip is %(zip)s.', {
	args: {
		city: city,
		zip: zip,
	},
} );

// Mixing strings and markup
// NOTE: This will return a React component, not a string
const component1 = i18n.translate( 'I bought my hat in {{country/}}.', {
	components: {
		country: <input name="someName" type="text" />,
	},
} );

// Mixing strings with markup that has nested content
const component2 = i18n.translate( 'My hat has {{link}}three{{/link}} corners', {
	components: {
		link: <a href="#three" />,
	},
} );

// add a comment to the translator
const content2 = i18n.translate( 'g:i:s a', {
	comment: 'draft saved date format, see http://php.net/date',
} );

// providing context
const content3 = i18n.translate( 'post', {
	context: 'verb',
} );
```

See the [test cases](test/test.jsx) for more example usage.

## numberFormat Method

The numberFormat method is also available to format numbers using the loaded locale settings (i.e., locale-specific thousands and decimal separators). You pass in the number (integer or float) and (optionally) the number of decimal places you want (or an options object), and a string is returned with the proper formatting for the currently-loaded locale. You can also override the locale settings for a particular number if necessary by expanding the second argument into an object with the attributes you want to override.

### Examples

```js
// These examples assume a 'de' (German) locale to demonstrate
// locale-formatted numbers
i18n.numberFormat( 2500.25 ); // '2.500'
i18n.numberFormat( 2500.1, 2 ); // '2.500,10'
i18n.numberFormat( 2500.33, { decimals: 3, thousandsSep: '*', decPoint: '@' } ); // '2*500@330'
```

## fixMe Method

Using the method `fixMe` you can apply a translation (`newCopy` parameter) only when a certain text has been translated or the locale is English (`en`, `en-gb`), otherwise apply the fallback translation (`oldCopy` parameter). This is a common pattern in the codebase for new translations that we need to ship straight away, and the function is meant to save a few inline conditions.

Important: Due to the way our string extraction mechanism works, always pass `i18n.translate( '...' )` for `newCopy` parameter as otherwise the new string will not be picked up for translation.

### Usage

```js
const i18n = require( 'i18n-calypso' );

i18n.fixMe( {
	text: 'new copy',
	newCopy: i18n.translate( 'new copy' ),
	oldCopy: i18n.translate( 'old copy' ),
} );
```

## hasTranslation Method

Using the method `hasTranslation` you can check whether a translation for a given string exists. As the `translate()` function will always return screen text that can be displayed (will supply the source text if no translation exists), it is unsuitable to determine whether text is translated. Other factors are optional [key hashing](#key-hashing) as well as purposeful translation to the source text.

Important: For most current usages in Calypso, where we conditionally render a new copy when a translation exists (otherwise a fallback), it's best to use `fixMe` method instead (above). It encapsulates a few of the conditions that would otherwise be necessary.

### Usage

```js
const i18n = require( 'i18n-calypso' );
i18n.hasTranslation( 'This has been translated' ); // true
i18n.hasTranslation( 'Not translation exists' ); // false
```

## Mixin

The mixin has been removed from this distribution. Please use version 1 of `i18n-calypso` if you need to use the mixin.

## Localize

`localize` is a higher-order component which, when invoked as a function with a component,
returns a new component class. The new component wraps the original component, passing all
original props plus props to assist in localization (`translate` and `numberFormat`).
The advantage of using a higher-order component instead of calling translate directly from
the `i18n-calypso` module is that the latter does not properly account for change events
which may be emitted by the state emitter object.

### Usage

Typically, you'd wrap your exported function with `localize`:

```jsx
// greeting.jsx
import { localize } from 'i18n-calypso';

function Greeting( { translate, className } ) {
	return <h1 className={ className }>{ translate( 'Hello!' ) }</h1>;
}

export default localize( Greeting );
```

When the wrapped component is rendered, the render behavior of the original component is used, but with access to localization props.

```jsx
// index.jsx
import { render } from 'react-dom';
import Greeting from './greeting';

render( <Greeting className="greeting" />, document.body );
```

## React Hook

The `useTranslate` hook is a modern alternative to the `localize` higher-order component that
exposes the `translate` method to React components as a return value of a React hook. The
resulting component is also reactive, i.e., it gets rerendered when the `i18n` locale changes
and the state emitter emits a `change` event.

The `useTranslate` hook returns the `translate` function:

```jsx
function MyComponent() {
	const translate = useTranslate();
}
```

The function can be called to return a localized value of a string, and it also exposes a
`localeSlug` property whose value is a string with the current locale slug.

### Usage

```jsx
import { useTranslate } from 'i18n-calypso';

function Greeting( { className } ) {
	const translate = useTranslate();
	debug( 'using translate with locale:', translate.localeSlug );
	return <h1 className={ className }>{ translate( 'Hello!' ) }</h1>;
}

export default Greeting;
```

Unlike the `localize` HOC, the component doesn't need to be wrapped and receives the `translate`
function from the hook call rather than a prop.

## React Localization Helpers for RTL

This module provides React helpers to figure out the LTR/RTL flag of the current `i18n-calypso`
locale, make it available to React components and update automatically on locale change.

### `useRtl` React Hook

Hook function that returns the `isRtl` boolean flag and automatically rerenders the component
(i.e., updates its internal state) when app locale changes from LTR to RTL language and back.

Example:

```jsx
import { Gridicon } from '@automattic/components';
import { useRtl } from 'i18n-calypso';

export default function Header() {
	const isRtl = useRtl();
	const icon = isRtl ? 'arrow-left' : 'arrow-right';
	return (
		<div>
			<Gridicon icon={ icon } />
			Header With Back Arrow
		</div>
	);
}
```

### `withRtl` Higher-Order Component

The same functionality is also exposed as a HOC that passes an `isRtl` prop to the wrapped component.

Example:

```jsx
import { Gridicon } from '@automattic/components';
import { withRtl } from 'i18n-calypso';

function Header( { isRtl } ) {
	const icon = isRtl ? 'arrow-left' : 'arrow-right';
	return (
		<div>
			<Gridicon icon={ icon } />
			Header With Back Arrow
		</div>
	);
}

export default withRtl( Header );
```

## Some Background

I18n accepts a language-specific locale json file that contains the list of allowed translation strings for your JS project, uses that data to instantiate a [Tannin](https://github.com/aduth/tannin) instance, and exposes a single `translate` method with sugared syntax for interacting with Tannin.

### Key Hashing

In order to reduce file-size, i18n-calypso allows the usage of hashed keys for lookup. This is a non-standard extension of the Jed standard (used by Tannin) which is enabled by supplying a header key `key-hash` to specify a hash method (currently only `sha1` is supported), as well as a hash length. For example `sha1-4` uses the first 4 hexadecimal chars of the sha1 hash of the standard Jed lookup string. As a further optimization, variable hash lengths are available, potentially requiring multiple lookups per string: `sha1-3-7` specifies that hash lengths of 3 to 7 are used in the file.

#### Example

Instead of providing the full English text, like here:

```json
{
	"": { "localeSlug": "de" },
	"Please enter a valid email address.": [ "", "Bitte gib eine gültige E-Mail-Adresse ein." ]
}
```

just the hash is used for lookup, resulting in a shorter file.

```json
{
	"": { "localeSlug": "de", "key-hash": "sha1-1" },
	"d": [ "", "Bitte gib eine gültige E-Mail-Adresse ein." ]
}
```

The generator of the jed file would usually try to choose the smallest hash length at which no hash collisions occur. In the above example a hash length of 1 (`d` short for `d2306dd8970ff616631a3501791297f31475e416`) is enough because there is only one string.

Note that when generating the jed file, all possible strings need to be taken into consideration for the collision calculation, as otherwise an untranslated source string would be provided with the wrong translation.

## Extracting Translatable Strings From JavaScript Sources

There is a companion [i18n-calypso-cli](https://npmjs.com/package/i18n-calypso-cli) package that provides a tool to extract `translate()`-d strings from your JavaScript code and generate a POT or PHP translation file.
