# Disallow collapsible whitespace in translatable strings

Using complex whitespace in translatable strings and relying on HTML to collapse
it can make translation more difficult and lead to unnecessary retranslation.

The short version is that this includes line-breaks, carriage-returns, tabs, and consecutive spaces. The [HTML whitespace spec](https://www.w3.org/TR/CSS21/text.html#white-space-model) allows for tabs in some cases, but we don't. Please use HTML for formatting, not whitespace, as this sidesteps any translation issues.

Whitespace can be appropriate in longer translatable content, for example a whole blog post. These cases are unlikey to occur in the code scanned by eslint but if they do, [disable the rule with inline coments](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments). ( e.g. `// eslint-disable-line i18n-no-collapsible-whitespace` ).

## Rule Details

The following patterns are considered warnings:

```js
translate( 'A string\non two lines' );
translate( 'A string\non two lines' );
translate( `A string
on two lines` );
translate( `A	string	with	tabs` );
translate( "Multiple spaces.  Even after a full stop.  (We're going there)" );
```

The following patterns are not warnings:

```js
translate( 'Hello World!' ) + '<br>' + translate( 'More text on another line' );
translate( '<p>Hello' + ' World!</p>' );
translate( `A long string ` + `spread over ` + `multiple lines.` );
```
