# @wordpress/url

A collection of utilities to manipulate URLs

## Installation

Install the module

```bash
npm install @wordpress/url --save
```

## Usage

```JS
import { addQueryArgs, prependHTTP } from '@wordpress/url';

// Appends arguments to the query string of a given url
const newUrl = addQueryArgs( 'https://google.com', { q: 'test' } ); // https://google.com/?q=test

// Prepends 'http://' to URLs that are probably mean to have them
const actualUrl = prependHTTP( 'wordpress.org' ); // http://wordpress.org
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
