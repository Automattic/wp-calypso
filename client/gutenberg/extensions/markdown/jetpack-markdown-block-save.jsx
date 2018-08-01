/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MarkdownPreview from './components/markdown-renderer';

function JetpackMarkdownBlockSave( { attributes, className } ) {
	return <MarkdownPreview
		className={ `${ className }-renderer` }
		source={ attributes.source }
	/>;
}

export default JetpackMarkdownBlockSave;
