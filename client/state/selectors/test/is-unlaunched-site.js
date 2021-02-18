/**
 * Internal dependencies
 */
import isUnlaunchedSite from '../is-unlaunched-site';

describe( 'isUnlaunchedSite()', () => {
	test( 'should be falsy when there is no such site', () => {
		expect(
			isUnlaunchedSite(
				{
					sites: {
						items: {},
					},
				},
				222
			)
		).toBeFalsy();
	} );

	test( 'should be falsy when site has no launch status', () => {
		expect(
			isUnlaunchedSite(
				{
					sites: {
						items: {
							222: {},
						},
					},
				},
				222
			)
		).toBeFalsy();
	} );

	test( 'should return false when site has non "launched" launch status', () => {
		expect(
			isUnlaunchedSite(
				{
					sites: {
						items: {
							222: {
								launch_status: 'launched',
							},
						},
					},
				},
				222
			)
		).toBe( false );
	} );

	test( 'should return false when site has non gibberish launch status', () => {
		expect(
			isUnlaunchedSite(
				{
					sites: {
						items: {
							222: {
								launch_status: 'gibberish',
							},
						},
					},
				},
				222
			)
		).toBe( false );
	} );

	test( 'should return true when site has "unlaunched" launch status', () => {
		expect(
			isUnlaunchedSite(
				{
					sites: {
						items: {
							222: {
								launch_status: 'unlaunched',
							},
						},
					},
				},
				222
			)
		).toBe( true );
	} );
} );
