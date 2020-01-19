/**
 * External dependencies
 */
import React from 'react';

export function chunkCssLinks( chunkAssets, isRTL ) {
	const styleAssets = chunkAssets[ isRTL ? 'css.rtl' : 'css.ltr' ];
	return styleAssets.map( asset => (
		<link key={ asset } rel="stylesheet" type="text/css" href={ asset } data-webpack />
	) );
}
