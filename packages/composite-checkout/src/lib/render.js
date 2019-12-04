/**
 * External dependencies
 */
import React from 'react';

export function renderDisplayValueMarkdown( displayValue ) {
	if ( ! displayValue ) {
		return '';
	}
	const pieces = displayValue.split( /~~/ );
	if ( pieces.length < 2 ) {
		return displayValue;
	}
	return pieces.reduce( ( all, piece, index ) => {
		if ( index === 0 ) {
			return [ piece ];
		}
		if ( index % 2 !== 0 ) {
			return [ ...all, <s key={ piece }>{ piece }</s> ];
		}
		return [ ...all, piece ];
	}, [] );
}
