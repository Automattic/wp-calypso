/** @format */

/**
 * External dependencies
 */
import MarkdownIt from 'markdown-it';
import { RawHTML } from '@wordpress/element';

/**
 * Module variables
 */
const markdownConverter = new MarkdownIt();

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
