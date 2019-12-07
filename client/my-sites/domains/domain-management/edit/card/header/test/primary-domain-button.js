/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import PrimaryDomainButton from '../primary-domain-button';

describe( 'PrimaryDomainButton', () => {
	test( 'it renders PrimaryDomainButton with basic plan', () => {
		const store = createReduxStore();
		const tree = renderer
			.create(
				<PrimaryDomainButton
					domain={ { name: 'foo.foo', prices: { USD: 50 } } }
					selectedSite={ { slug: 'foo.foo' } }
					store={ store }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
