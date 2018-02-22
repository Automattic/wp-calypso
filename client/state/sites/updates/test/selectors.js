/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getUpdatesBySiteId } from '../selectors';

describe( 'selectors', () => {
	describe( '#getUpdatesBySiteId()', () => {
		test( 'should return null if site updates have not been fetched yet', () => {
			const updates = getUpdatesBySiteId(
				{
					sites: {
						updates: {
							items: {},
						},
					},
				},
				12345678
			);

			expect( updates ).to.be.null;
		} );

		test( 'should return the updates for an existing site', () => {
			const exampleUpdates = {
				plugins: 1,
				total: 1,
			};
			const updates = getUpdatesBySiteId(
				{
					sites: {
						updates: {
							items: {
								12345678: exampleUpdates,
							},
						},
					},
				},
				12345678
			);

			expect( updates ).to.eql( exampleUpdates );
		} );
	} );
} );
