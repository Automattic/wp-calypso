/** @format */

/**
 * Internal dependencies
 */
import MarkdownRenderer from './renderer';

function JetpackMarkdownBlockSave( { attributes, className } ) {
	return <MarkdownRenderer className={ className } source={ attributes.source } />;
}

export default JetpackMarkdownBlockSave;
