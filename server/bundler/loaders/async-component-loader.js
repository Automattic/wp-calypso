module.exports = function() {
	this.cacheable();

	// Use the original "raw" request path, not the resolved absolute
	const rawRequest = this._module.rawRequest;
	const resource = rawRequest.substr( rawRequest.lastIndexOf( '!' ) + 1 );

	return `
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

export default function( props ) {
	return <AsyncLoad require="${ resource }" { ...props } />;
}`;
};
