/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getRestoreError from 'calypso/state/selectors/get-restore-error';

const SITE_ID = 1234;

describe( 'getRestoreError()', () => {
	test( 'should return null if no error exists for a site', () => {
		const result = getRestoreError(
			{
				activityLog: {
					restoreError: {},
				},
			},
			SITE_ID
		);
		expect( result ).to.be.null;
	} );

	test( 'should return an existing error for a site', () => {
		const error = {
			error: 'error',
			message: 'Error.',
			status: 400,
		};
		const result = getRestoreError(
			{
				activityLog: {
					restoreError: {
						[ SITE_ID ]: error,
					},
				},
			},
			SITE_ID
		);
		expect( result ).to.deep.equal( error );
	} );
} );
