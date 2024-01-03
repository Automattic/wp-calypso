const css = `
	body {
		overflow-y: hidden;
		background-color: transparent;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			"Segoe UI",
			Roboto,
			Oxygen-Sans,
			Ubuntu,
			Cantarell,
			"Helvetica Neue",
			sans-serif;
	}

	/* This is need for useResizeObserver to work. */
	.editor__block-canvas-container {
		box-sizing: border-box;
		position: absolute;
		width: 100%;
	}

	/* Padding around the canvas. */
	.is-root-container.block-editor-block-list__layout {
		padding: 10px 20px 60px;
		display: block;
	}

	/* Hide the inserter button in the default block. */
	.is-root-container.block-editor-block-list__layout .block-editor-default-block-appender .block-editor-inserter {
		display: none;
	}

	/* Add padding to the paragraph block. */
	.is-root-container.block-editor-block-list__layout > p {
		padding: 4px 6px;
	}

	/* Hide the upload button and instructions for IMAGE blocks. */
	.components-placeholder__instructions,
	.components-button.block-editor-media-placeholder__button.block-editor-media-placeholder__upload-button {
		display: none;
	}
`;

export default css;
