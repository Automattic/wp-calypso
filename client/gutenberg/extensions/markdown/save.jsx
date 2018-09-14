/** @format */

/**
 * Internal dependencies
 */
import React from 'react';
import MarkdownRenderer from './renderer';

export default ( { attributes, className } ) => (
	<MarkdownRenderer className={ className } source={ attributes.source } />
);
