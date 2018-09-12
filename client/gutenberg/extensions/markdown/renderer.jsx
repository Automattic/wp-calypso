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

export default ( { className, source = '' } ) => (
	<RawHTML className={ className }>
		{ source.length ? markdownConverter.render( source ) : '' }
	</RawHTML>
);
