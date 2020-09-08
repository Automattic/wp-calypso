export const shouldLoadGutenberg = () => {
	/* Now the Calypso editor is deprecated we should always load Gutenberg.
	 * If we need to redirect to wp-admin, that is handled as Gutenberg is loaded.
	 */
	return true;
};

export default shouldLoadGutenberg;
