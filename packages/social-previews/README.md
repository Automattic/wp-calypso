# Social Previews

This package contains low level components that can be used to display an _approximation_ of how a given post might like look when viewed on various social media / search platforms.

At the current time there are components to display previews for a:

- Facebook post.
- Twitter post.
- Google Search result.

## Prerequisites

Your application must be able to load Sass/SCSS files. You may implement this
however you like.

- In a wp-calypso or jetpack environment, Sass loading is already provided.
- If you're using create-react-app, you may install `node-sass` or [read the
  CRA documentation on
  sass](https://create-react-app.dev/docs/adding-a-sass-stylesheet/) for more
  info.
- If you're using your own webpack config, [read the webpack documentation on
  adding a sass-loader](https://webpack.js.org/loaders/sass-loader/).

## Usage

Here's a simple usage example using the preview component for Facebook:

```js
import { FacebookPreview } from '@automattic/social-previews';

<FacebookPreview
	title="Five for the Future"
	description="Launched in 2014, Five for the Future encourages organizations to contribute five percent of their resources to WordPress development. WordPress co-founder Matt Mullenweg proposed this benchmark to maintain a “golden ratio” of contributors to users."
	url="https://wordpress.org/five-for-the-future/"
	author="Matt Mullenweg"
/>;
```

Here is another example using the Search result component:

```js
import { SearchPreview } from '@automattic/social-previews';

<SearchPreview
	title="Five for the Future"
	description="Launched in 2014, Five for the Future encourages organizations to contribute five percent of their resources to WordPress development. WordPress co-founder Matt Mullenweg proposed this benchmark to maintain a “golden ratio” of contributors to users."
	url="https://wordpress.org/five-for-the-future/"
	author="Matt Mullenweg"
/>;
```

## Properties

There are a number of common properties used across all components:

- `title` - the title of the post being previewed.
- `description` - a longer description of the post being previewed.
- `url` - the full URL of the post being previewed.

In addition each individual component accepts optional additional properties that may be specific to their given platform (eg: `image`, `author`...etc).

## Auto Truncation

Note that due to limits enforced by each given platform some strings may need to be truncated. Each component has its individual rules governing the number of characters in a given field allowed before truncation occurs. Limits are typically higher for `description` fields and shorter for `title` fields. Truncation by `SPACE` character is preferred, but where that is not possible a hard truncation is imposed. In both cases an ellipsis character (`…`)`is appended to the end of the string to indicate that a truncation has occurred.
