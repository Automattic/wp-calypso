# Disallow newlines in translatable strings

While it's not wrong to include newlines in translatable strings, it is
exceptional.

Newlines in translatable strings go into the translation system
and the length of lines in different languages varies significantly. It is
better to manage this variance using the design of elements on the page. Trying
to manage it with text inappropriately pushes design responisibilties onto
translators.

The only time it is appropriate to include newlines is in full prose, for
example, translating an entire email or blog post. These cases are unlikey to
occur in the code scanned by eslint. If they do, this rule should be disabled by
appending a comment to the line: `// eslint-disable-line i18n-no-newlines`

## Rule Details

The following patterns are considered warnings:

```js
translate( "My string\non two lines" );
translate( 'My string\non two lines' );
translate( `My string
on two lines` );
```

The following patterns are not warnings:

```js
translate( 'Hello World!' ) + '<br>' + translate( 'More text on another line' );
translate( '<p>Hello' + ' World!</p>' );
```
