/** @format */

/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import PreferenceList from './preference-list';

export default function injectPreferenceHelper( element, store ) {
	ReactDom.render(
		<Provider store={ store }>
			<PreferenceList />
		</Provider>,
		element
	);
}
