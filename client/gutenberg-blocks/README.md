# Gutenberg Blocks

The [Gutenberg editor](https://wordpress.org/gutenberg/) uses 
[blocks](https://wordpress.org/gutenberg/handbook/language/) to create all types
of content. A Gutenberg block is the abstract term used to describe units of markup that, 
composed together, form the content or layout of a webpage.

Calypso provides all the built-in Gutenberg blocks included in the
[`@wordpress/block-library`](https://www.npmjs.com/package/@wordpress/block-library) package, so 
they can be used for building the user interface of Calypso. 

A Gutenberg block provides two interfaces: 
[`edit` and `save`](https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/).
`edit` describes the structure of the block in the context of the editor and `save` defines the way 
in which the different attributes should be combined into the final markup.

In order to include Gutenberg blocks in the Calypso's UI, you only need yo use the `save` function,
as the lack of an editor when building it means we can ignore the `edit` interface.

You can use the `GutenbergBlock` component as an abstraction on how to render Gutenberg blocks in
Calypso.

```jsx 
import GutenbergBlock from 'gutenberg-blocks';

const MyGutenbergBlock = () => (
	<GutenbergBlock
		name="core/button"
		attributes={ {
			text: 'Click here',
			backgroundColor: 'vivid-cyan-blue',
			url: 'https://wordpress.com',
		} }
	/>
);
```

The previous example is equivalent to:

```jsx 
import { getBlockType, getSaveElement } from '@wordpress/blocks';

const MyGutenbergBlock = () => getSaveElement( getBlockType( 'core/button' ), {
	text: 'Click here',
	backgroundColor: 'vivid-cyan-blue',
	url: 'https://wordpress.com',
} );
```

Some of these blocks can be seen in action in our 
[DevDocs: Gutenberg Blocks](/devdocs/gutenberg-blocks) section.
