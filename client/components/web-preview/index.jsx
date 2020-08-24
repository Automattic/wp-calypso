/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

const WebPreview = ( props ) => {
	if ( ! props.showPreview ) {
		return null;
	}

	return <AsyncLoad { ...props } require="components/web-preview/component" />;
};

export default WebPreview;
