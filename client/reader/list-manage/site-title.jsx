/**
 * External dependencies
 */
import React from 'react';

function SiteTitle( { site: { name, URL, feed_URL } } ) {
	return <>{ name || URL || feed_URL }</>;
}

export default SiteTitle;
