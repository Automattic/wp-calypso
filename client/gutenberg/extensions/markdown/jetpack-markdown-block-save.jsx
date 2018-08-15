/** @format */

/**
 * Internal dependencies
 */
import MarkdownPreview from './components/markdown-renderer';

function JetpackMarkdownBlockSave( { attributes, className } ) {
	return <MarkdownPreview className={ className } source={ attributes.source } />;
}

export default JetpackMarkdownBlockSave;
