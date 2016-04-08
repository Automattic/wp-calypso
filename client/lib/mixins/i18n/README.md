I18n
============

This mixin is automatically added to all React components and enables translations by adding a [`translate` method](#translate-method) to the host module. It is recommeded to call the `initialize` method on app startup. (See the [boot source](../../../boot/index.js) for an example.) After startup, you may call the `setLocaleSlug` method to manually set a particular language preference for translations, although this happens automatically if the `localeSlug` on the User object changes. When added to a React component, this mixin also takes care of forcing an update to the component if the language preference changes for any reason.

You can also use this mixin as a standalone object if you want to use it outside of React. You will need to respond to 'change' events yourself. [See standalone usage](#standalone-usage).

> Special Note: Translation strings that you add to Calypso will also need to be added to a whitelist file in the WordPress.com codebase using the equivalent WordPress syntax. You can run `make translate` to generate a file containing all strings at `./calypso-strings.php` that you can copy into the wpcom codebase.

This mixin exposes three public methods:

* [.translate()](#translate-method)
* [.moment()](#moment-method)
* [.numberFormat()](#numberformat-method)

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

* **options.context** [string] provides context for ambiguous terms. For example, "post" could be a noun or a verb.
* **options.comment** [string] comment that will be shown to the translator for anything that may need to be explained about the translation.
* **options.args** [string, array, or object] arguments you would pass into sprintf to be run against the text for string substitution. [See docs](http://www.diveintojavascript.com/projects/javascript-sprintf)
* **options.components** [object] markup must be added as React components and not with string substitution. See [mixing strings and markup](#mixing-strings-and-markup).

## Usage

If you pass a single string into `translate`, it will trigger a simple translation without any context, pluralization, sprintf arguments, or comments. You would call it like this.

```js
var translation = this.translate( 'Some content to translate' );
```

### Strings Only

Translation strings are extracted from our codebase through a process of [static analysis](http://en.wikipedia.org/wiki/Static_program_analysis) and imported into GlotPress where they are translated ([more on that process here](../../../../server/i18n)). So you must avoid passing a variable, ternary expression, function call, or other form of logic in place of a string value to the `translate` method. The _one_ exception is that you can split a long string into mulitple substrings concatenated with the `+` operator.

```js
/*----------------- Bad Examples -----------------*/

// don't pass a logical expression argument
var translation = this.translate( condition ? 'foo' : 'bar' );

// don't pass a variable argument
var translation = this.translate( foo );

// don't pass a function call argument
var translation = this.translate( foo( 'bar' ) );

/*----------------- Good Examples -----------------*/

// do pass a string argument
var example = this.translate( 'foo' );

// do concatenate long strings with the + operator
var translation = this.translate(
    'I am the very model of a modern Major-General, ' +
    'I\'ve information vegetable, animal, and mineral, ' +
    'I know the kings of England, and I quote the fights historical ' +
    'from Marathon to Waterloo, in order categorical.'
);
```

### String Substitution

The `translate()` method uses sprintf interpolation for string substitution ([see docs for syntax details](http://www.diveintojavascript.com/projects/javascript-sprintf)). The `option.args` value is used to inject variable content into the string.

```js
// named arguments (preferred approach)
this.translate( 'My %(thing)s has %(number)d corners', {
    args: {
        thing: 'hat',
        number: 3
    }
} );
// 'My hat has 3 corners'

// argument array
this.translate( 'My %s has %d corners', {
    args: [ 'hat', 3 ]
} );
// 'My hat has 3 corners'

// single substitution
this.translate( 'My %s has 3 corners', {
    args: 'hat'
} );
// 'My hat has 3 corners'
```

### Mixing Strings And Markup

Because React tracks DOM nodes in the virtual DOM for rendering purposes, you cannot use string substitution with html markup as you might in a php scenario, because we don't render arbitrary html into the page, we are creating a virtual DOM in React.

Instead we use the [interpolate-components module](../../../lib/interpolate-components) to inject components into the string using a component token as a placeholder in the string and a components object, similar to how string substitution works. The result of the `translate()` method can then be inserted as a child into another React component. Component tokens are strings (containing letters, numbers, or underscores only) wrapped inside double-curly braces and have an opening, closing, and self-closing syntax, similar to html.

**NOTE: Always use a JSX element for passing components. Otherwise you will need to [wrap your React classes with `createFactory`](http://facebook.github.io/react/blog/2014/10/14/introducing-react-elements.html). Any wrapped content inside opening/closing component tokens will be inserted/replaced as the children of that component in the output. Component tokens must be unique:**

```js
// self-closing component syntax
var example = this.translate( 'My hat has {{hatInput/}} corners', {
        components: {
            hatInput: <input name="hatInput" type="text" />
        }
    } );

// component that wraps part of the string
var example2 = this.translate( 'I feel {{em}}very{{/em}} strongly about this.', {
        components: {
            em: <em />
        }
    } );

// components can nest 
var example3 = this.translate( '{{a}}{{icon/}}click {{em}}here{{/em}}{{/a}} to see examples.', {
        components: {
            a: <a href="#" />,
            em: <em />,
            icon: <Icon size="huge" />
        }
    } );


```

### Pluralization

You must specify both the singular and plural variants of a string when it contains plurals. If the string uses placeholders that will be replaced with actual values, then both the plural and singular strings should include those placeholders. It might seem redundant, but it is necessary for languages where a singular version may be used for counts other than 1.


```js

// An example where the translated string does not have
// a number represented directly, but still depends on it
var numHats = howManyHats(), // returns integer
    content = this.translate(
    	'My hat has three corners.',
    	'My hats have three corners.',
    	{ 
            count: numHats
        }
    );

// An example where the translated string includes the actual number it depends on
var numDays = daysUntilExpiration(), // returns integer
    content = this.translate(
        'Your subscription will expire in %(numberOfDays)d day.',
        'Your subscription will expire in %(numberOfDays)d days.',
        {
            count: numDays,
            args: {
                numberOfDays: numDays
            }
        }
    );

```

### More translate() Examples

```js
// simplest case... just a translation, no special options
var content = this.translate( 'My hat has three corners.' );

// providing context
var content = this.translate( 'post', {
        context: 'verb'
    } );

// add a comment to the translator
var content = this.translate( 'g:i:s a', {
        comment: 'draft saved date format, see http://php.net/date'
    } );

// sprintf-style string substitution
var city = getCity(), // returns string
    zip = getZip(), // returns string
    content = this.translate( 'Your city is %(city)s, your zip is %(zip)s.', {
        args: {
            city: city,
            zip: zip
        }
    } );

// Mixing strings and markup
// NOTE: This will return a React component, not a string
var component = this.translate( 'My hat has {{numHats/}} corners', {
        components: {
            numHats: <input name="someName" type="text" />
        }
    } );

// Mixing strings with markup that has nested content
var component = this.translate( 'My hat has {{link}}three{{/link}} corners', {
        components: {
            link: <a href="#three" />
        }
    } );
```

See the [test cases](test/test.jsx) for more example usage.

## Standalone Usage

The I18n module can be used as a standalone module outside of a React mixin. But keep in mind that you will need to respond to 'change' events yourself in order to repaint your UI, if for example the user decides to switch languages. You can test this approach by sticking this code just about anywhere.

```js
var i18n = require( 'lib/mixins/i18n' );
console.log( i18n.translate( 'Posts' ) );
i18n.on( 'change', function() {
     console.log('changed');
     console.log( i18n.translate( 'Posts' ) );
});
```

### Tests

When using i18n as a standalone module, your tests need to call `i18n.initialize()` before any of the i18n methods can be used. `initialize()` is normally called during the Calypso boot sequence, which is not run for tests. Not calling this for tests may result in the tests failing with errors.

```js
var i18n = require( 'lib/mixins/i18n' );
i18n.initialize();
```

## Moment Method

This module includes an instantiation of `moment.js` to allow for internationalization of dates and times. We generate a momentjs locale file as part of loading a locale and automatically update the moment instance to use the correct locale and translations. You can use `moment()` from within any component like this:

```js
var thisMagicMoment = this.moment( "2014-07-18T14:59:09-07:00" ).format( 'LLLL' );
```

And you can use it from outside of React like this.

```js
var i18n = require( 'lib/mixins/i18n' );
var thisMagicMoment = i18n.moment( "2014-07-18T14:59:09-07:00" ).format( 'LLLL' );
```

## numberFormat Method

The numberFormat method is also available to format numbers using the loaded locale settings (i.e., locale-specific thousands and decimal separators). You pass in the number (integer or float) and (optionally) the number of decimal places you want (or an options object), and a string is returned with the proper formatting for the currently-loaded locale. You can also override the locale settings for a particular number if necessary by expanding the second argument into an object with the attributes you want to override.

### Examples

```js
// These examples assume a 'de' (German) locale to demonstrate
// locale-formatted numbers
this.numberFormat( 2500.25 ); // '2.500'
this.numberFormat( 2500.1, 2 ); // '2.500,10'
this.numberFormat( 2500.33, { decimals: 3, thousandsSep: '*', decPoint: '@'} ); // '2*500@330'
```

As with the other public i18n methods, you can use this from within the mixin or from an instantiation of `i18n`.

## Some Background

I18n loads a language-specific locale json file from WordPress that contains the whitelisted translation strings for Calypso, uses that data to instantiate a [Jed](http://slexaxton.github.io/Jed/) instance, and exposes a single `translate` method with sugared syntax for interacting with Jed.

Calypso locale files are generated from the WordPress codebase. Locale files are automatically updated as new translations are deployed based on a whitelist file in the WordPress.com codebase. _This means that any translation strings that are added to Calypso will also need to be added to the whitelist file in WordPress.com manually (using equivalent WordPress i18n functions)_.
