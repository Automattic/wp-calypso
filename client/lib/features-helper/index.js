/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import FeatureList from './feature-list';

/**
 * Style dependencies
 *
 * @param element
 * @param store
 */
import './style.scss';

/**
 * @param element HTML Element
 * @param store Redux Store
 */
export default function injectFeatureHelper( element, store ) {
	ReactDom.render(
		<Provider store={ store }>
			<FeatureList />
		</Provider>,
		element
	);
}
