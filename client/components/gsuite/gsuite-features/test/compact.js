/** @format */
/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuiteCompactFeatures from '../compact';

describe( 'GSuiteCompactFeatures', () => {
	test( 'it renders GSuiteCompactFeatures with basic plan', () => {
		const tree = renderer
			.create( <GSuiteCompactFeatures domainName={ 'testing123.com' } productSlug={ 'gapps' } /> )
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteCompactFeatures with business plan', () => {
		const tree = renderer
			.create(
				<GSuiteCompactFeatures domainName={ 'testing123.com' } productSlug={ 'gapps_unlimited' } />
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteCompactFeatures in a grid', () => {
		const tree = renderer
			.create(
				<GSuiteCompactFeatures
					domainName={ 'testing123.com' }
					productSlug={ 'gapps' }
					type={ 'grid' }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteCompactFeatures in a list', () => {
		const tree = renderer
			.create(
				<GSuiteCompactFeatures
					domainName={ 'testing123.com' }
					productSlug={ 'gapps' }
					type={ 'list' }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
