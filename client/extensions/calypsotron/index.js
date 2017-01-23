/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { navigation, siteSelection } from 'my-sites/controller';
import { renderWithReduxStore } from 'lib/react-helpers';
import Main from 'components/main';
import TestQuery from './test-query';

/**
 * Internal dependencies
 */
import ProductList from './app/product-list';

// TODO: Remove this temporary code.
import dummyCategories from './dummy-categories.json';
import dummyTaxClasses from './dummy-tax-classes.json';

const dummyProps = {
	categories: dummyCategories,
	taxClasses: dummyTaxClasses,
	currencySymbol: '$',
	currencyIsPrefix: true,
	currencyDecimals: 2,
};

const render = ( context ) => {
	renderWithReduxStore( (
		<Main className="calypsotron__main" wideLayout>
			<ProductList { ...dummyProps } />
			<TestQuery />
		</Main>
	), document.getElementById( 'primary' ), context.store );
};

export default function() {
	page( '/calypsotron/:site?', siteSelection, navigation, render );
}
