/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getActivityLogs } from '..';

const SITE_ID = 1234;

describe( 'getActivityLogs()', () => {
	it( 'should return null if there is no data', () => {
		const result = getActivityLogs(
			{
				activityLog: {
					logItems: {},
				},
			},
			SITE_ID
		);

		expect( result ).to.be.null;
	} );

	it( 'should return logs', () => {
		const logs = [ { log: 'a' }, { log: 'b' } ];

		const result = getActivityLogs(
			{
				activityLog: {
					logItems: {
						[ SITE_ID ]: logs,
					},
				},
			},
			SITE_ID
		);

		expect( result ).to.deep.equal( logs );
	} );
} );
