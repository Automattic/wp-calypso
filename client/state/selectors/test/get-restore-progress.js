/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';

const SITE_ID = 1234;

describe( 'getRestoreProgress()', () => {
	test( 'should return null if no progress exists for a site', () => {
		const result = getRestoreProgress(
			{
				activityLog: {
					restoreProgress: {},
				},
			},
			SITE_ID
		);
		expect( result ).to.be.null;
	} );

	test( 'should return existing progress for a site', () => {
		const progress = {
			complete: false,
			percent: 20,
			status: 'in-progress',
		};
		const result = getRestoreProgress(
			{
				activityLog: {
					restoreProgress: {
						[ SITE_ID ]: progress,
					},
				},
			},
			SITE_ID
		);
		expect( result ).to.deep.equal( progress );
	} );
} );
