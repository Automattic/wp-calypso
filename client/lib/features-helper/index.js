/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';

/**
 * Internal dependencies
 */
import FeatureList from './feature-list';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * @param element HTML Element
 */
export default function injectFeatureHelper( element ) {
	ReactDom.render( <FeatureList />, element );
}
