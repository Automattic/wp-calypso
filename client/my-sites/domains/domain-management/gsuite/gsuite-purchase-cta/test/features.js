/** @format */
/**
 * External dependencies
 */
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import GSuitePurchaseCtaFeatures from '../features';

describe( 'GSuitePurchaseCtaFeatures', () => {
	test( 'it renders GSuitePurchaseCtaFeatures with basic plan', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuitePurchaseCtaFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePurchaseCtaFeatures with business plan', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuitePurchaseCtaFeatures
						domainName={ 'testing123.com' }
						productSlug={ 'gappsbusiness' }
					/>
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePurchaseCtaFeatures in a grid', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuitePurchaseCtaFeatures
						domainName={ 'testing123.com' }
						productSlug={ 'gapps' }
						type={ 'grid' }
					/>
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuitePurchaseCtaFeatures in a list', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuitePurchaseCtaFeatures
						domainName={ 'testing123.com' }
						productSlug={ 'gapps' }
						type={ 'list' }
					/>
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
