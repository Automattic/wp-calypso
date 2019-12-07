/** @format */
/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuiteFeatures from '../';

describe( 'GSuiteFeatures', () => {
	test( 'it renders GSuiteFeatures with basic plan', () => {
		const tree = renderer
			.create( <GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } /> )
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures with business plan', () => {
		const tree = renderer
			.create(
				<GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps_unlimited' } />
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures without a productSlug', () => {
		const tree = renderer.create( <GSuiteFeatures domainName={ 'testing123.com' } /> ).toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures in a list', () => {
		const tree = renderer
			.create(
				<GSuiteFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } type={ 'list' } />
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
