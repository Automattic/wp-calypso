/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';

/**
 * Internal dependencies
 */
import ProductList from './app/product-list';

// TODO: Remove this temporary code.
import dummyProductObject from './dummy-product-object.json';
import dummyCategories from './dummy-categories.json';
import dummyTaxClasses from './dummy-tax-classes.json';

const dummyProps = {
	productListState: dummyProductObject,
	categories: dummyCategories,
	taxClasses: dummyTaxClasses,
	currencySymbol: '$',
	currencyIsPrefix: true,
	currencyDecimals: 2,
};

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="calypsotron__main">
			<ProductList { ...dummyProps } />
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/calypsotron/:site?', siteSelection, navigation, render );
}

