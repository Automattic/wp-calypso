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
import GSuiteFeatures from '../';

describe( 'GSuiteFeatures', () => {
	test( 'it renders GSuiteFeatures with basic plan', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures with business plan', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps_unlimited' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures in a grid', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } type={ 'grid' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures in a list', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<Provider store={ store }>
					<GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } type={ 'list' } />
				</Provider>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
