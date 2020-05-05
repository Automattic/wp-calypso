/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG } from 'lib/gsuite/constants';
import GSuiteCompactFeatures from '../compact';

describe( 'GSuiteCompactFeatures', () => {
	test( 'it renders GSuiteCompactFeatures with basic plan', () => {
		const tree = renderer
			.create(
				<GSuiteCompactFeatures domainName={ 'testing123.com' } productSlug={ GSUITE_BASIC_SLUG } />
			)
			.toJSON();

		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteCompactFeatures with business plan', () => {
		const tree = renderer
			.create(
				<GSuiteCompactFeatures
					domainName={ 'testing123.com' }
					productSlug={ GSUITE_BUSINESS_SLUG }
				/>
			)
			.toJSON();

		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteCompactFeatures with no productSlug', () => {
		const tree = renderer
			.create( <GSuiteCompactFeatures domainName={ 'testing123.com' } /> )
			.toJSON();

		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteCompactFeatures in a list', () => {
		const tree = renderer
			.create(
				<GSuiteCompactFeatures
					domainName={ 'testing123.com' }
					productSlug={ GSUITE_BASIC_SLUG }
					type={ 'list' }
				/>
			)
			.toJSON();

		expect( tree ).toMatchSnapshot();
	} );
} );
