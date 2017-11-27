/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getActivityLogs } from 'state/selectors';
import ActivityQueryManager from 'lib/query-manager/activity';

const SITE_ID = 1234;

describe( 'getActivityLogs()', () => {
	test( 'should return null if there is no data', () => {
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

	test( 'should return logs', () => {
		const items = [ { activityId: 'a', activityTs: 1 }, { activityId: 'b', activityTs: 2 } ];
		const query = {
			siteId: SITE_ID,
		};

		const result = getActivityLogs(
			{
				activityLog: {
					logItems: {
						[ SITE_ID ]: new ActivityQueryManager().receive( items, {
							query,
							found: items.length,
						} ),
					},
				},
			},
			SITE_ID,
			query
		);

		expect( result ).to.deep.equal( items );
	} );
} );
