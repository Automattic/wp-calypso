/** @format */

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import PreferenceList from './PreferenceList';

export default function injectPreferenceHelper( element, store ) {
	ReactDom.render( React.createElement( PreferenceList, { store } ), element );
}
