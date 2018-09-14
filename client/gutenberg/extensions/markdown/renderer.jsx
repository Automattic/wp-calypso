/** @format */

/**
 * External dependencies
 */
import React from 'react';
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
