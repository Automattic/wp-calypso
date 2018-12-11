/** @format */
/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import AddGoogleApps from '../';

const noop = () => {};

describe( 'AddGoogleApps', () => {
	test( 'it renders AddGoogleApps correctly', () => {
		const tree = renderer
			.create(
				<AddGoogleApps
					domains={ [ { name: 'foo' } ] }
					isRequestingSiteDomains={ false }
					selectedDomainName="foo.blog"
					selectedSite={ { slug: 'foo.blog' } }
					translate={ noop }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
