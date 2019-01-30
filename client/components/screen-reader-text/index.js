/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export default function ScreenReaderText( { children } ) {
	return <span className="screen-reader-text">{ children }</span>;
}
