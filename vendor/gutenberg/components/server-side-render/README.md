ServerSideRender
=======

ServerSideRender is a component used for server-side rendering a preview of dynamic blocks to display in the editor. Server-side rendering in a block's `edit` function should be limited to blocks that are heavily dependent on existing PHP rendering logic that is heavily intertwined with data, particularly when there are no endpoints available.

ServerSideRender may also be used when a legacy block is provided as a backwards compatibility measure, rather than needing to re-write the deprecated code that the block may depend on.

ServerSideRender should be regarded as a fallback or legacy mechanism, it is not appropriate for developing new features against.

New blocks should be built in conjunction with any necessary REST API endpoints, so that JavaScript can be used for rendering client-side in the `edit` function. This gives the best user experience, instead of relying on using the PHP `render_callback`. The logic necessary for rendering should be included in the endpoint, so that both the client-side JavaScript and server-side PHP logic should require a minimal amount of differences.

## Usage

Render core/archives preview.

```jsx
	<ServerSideRender
		block="core/archives"
		attributes={ this.props.attributes }
	/>
```

## Output

Output uses the block's `render_callback` function, set when defining the block.

## API Endpoint

The API endpoint for getting the output for ServerSideRender is `/gutenberg/v1/block-renderer/:block`. It accepts any params, which are used as `attributes` for the block's `render_callback` method.

