/** @format */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
// import Debug from 'debug';
/**
 * Internal dependencies
 */
import PreferenceList from './PreferenceList';
// import { getAllTests } from 'lib/abtest';
// import { ABTEST_LOCALSTORAGE_KEY } from 'lib/abtest/utility';

// const debug = Debug( 'calypso:abtests:helper' );

export default function injectPreferenceHelper( element ) {
	ReactDom.render( React.createElement( PreferenceList ), element );
}
