/** @format */

/**
 * External dependencies
 */
import { RawHTML } from '@wordpress/element';

/**
 * Internal dependencies
 */
import markdownConverter from '../utils/markdown-converter';

const MarkdownRenderer = function( props ) {
	const { className, source } = props;

	let content = '';

	if ( source ) {
		// converts the markdown source to HTML
		content = markdownConverter.render( source );
	}
	return <RawHTML className={ className }>{ content }</RawHTML>;
};

export default MarkdownRenderer;
