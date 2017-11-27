/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getActivityLog } from 'state/selectors';
import ActivityQueryManager from 'lib/query-manager/activity';

const SITE_ID = 1234;

describe( 'getActivityLog()', () => {
	test( 'should return null if there is no data', () => {
		const result = getActivityLog(
			{
				activityLog: {
					logItems: {},
				},
			},
			SITE_ID
		);

		expect( result ).to.be.null;
	} );

	test( 'should return null if the activityId is not found', () => {
		const activity = { activityId: 'fooBarBaz', activityTs: 1 };

		const result = getActivityLog(
			{
				activityLog: {
					logItems: {
						[ SITE_ID ]: new ActivityQueryManager().receive( [ activity ], {
							found: 1,
						} ),
					},
				},
			},
			'nonExistentId'
		);

		expect( result ).to.be.null;
	} );

	test( 'should return log by id', () => {
		const activityId = 'fooBarBaz';
		const activity = { activityId, activityTs: 1 };
		const items = [ { activityId: 'anotherActivity', activityTs: 2 }, activity ];

		const result = getActivityLog(
			{
				activityLog: {
					logItems: {
						[ SITE_ID ]: new ActivityQueryManager().receive( items, {
							found: items.length,
						} ),
					},
				},
			},
			SITE_ID,
			activityId
		);

		expect( result ).to.deep.equal( activity );
	} );
} );
