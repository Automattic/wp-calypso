import { bumpStat } from 'calypso/lib/analytics/mc';
import { pageViewForPost } from 'calypso/reader/stats';
import { markPostSeen, resetSeenPostGlobalIdsForTests } from '../mark-post-seen';

jest.mock( 'calypso/lib/analytics/mc', () => ( {
	bumpStat: jest.fn(),
} ) );

jest.mock( 'calypso/reader/stats', () => ( {
	pageViewForPost: jest.fn(),
} ) );

describe( 'markPostSeen', () => {
	beforeEach( () => {
		resetSeenPostGlobalIdsForTests();
		pageViewForPost.mockReset();
		bumpStat.mockReset();
	} );

	test( 'does nothing when post is falsey', () => {
		markPostSeen( null );

		expect( pageViewForPost ).not.toHaveBeenCalled();
		expect( bumpStat ).not.toHaveBeenCalled();
	} );

	test( 'does not send pageviews twice for the same post in one session', () => {
		const post = { global_ID: 'mark-post-seen-test-dedupe', ID: 1, site_ID: 1 };
		const site = { ID: 1 };
		markPostSeen( post, site );
		pageViewForPost.mockReset();
		bumpStat.mockReset();

		markPostSeen( post, site );

		expect( pageViewForPost ).not.toHaveBeenCalled();
		expect( bumpStat ).not.toHaveBeenCalled();
	} );

	test( 'sends pageviews for unseen posts with sites', () => {
		const post = { global_ID: 'mark-post-seen-test-pageview', ID: 2, site_ID: 1 };
		const site = { ID: 1, URL: 'https://example.com', is_private: false };

		markPostSeen( post, site );

		expect( pageViewForPost ).toHaveBeenCalledWith( 1, 'https://example.com', 2, false );
		expect( bumpStat ).toHaveBeenCalledWith( 'reader_pageviews', 'public_view' );
	} );
} );
