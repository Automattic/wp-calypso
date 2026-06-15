import { addReadSpaceSource, createReadSpace, deleteReadSpaceSource } from '../mutators';
import type { SiteSubscriptionItem } from '../../read-follows';

const SPACE_ID = '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21';

const makeSubscription = (
	overrides: Partial< SiteSubscriptionItem > = {}
): SiteSubscriptionItem => ( {
	ID: 1,
	URL: 'https://stratechery.com',
	feed_URL: 'https://stratechery.com/feed',
	blog_ID: 123,
	feed_ID: 456,
	name: 'Stratechery',
	site_icon: 'https://stratechery.com/icon.png',
	is_following: true,
	...overrides,
} );

// NOTE: these mutators are placeholders that resolve locally without any
// network call, so there's nothing to intercept yet. Once the real endpoints
// land (create: RSM-4139; add/remove source) and these issue `wpcom.req`
// requests, mock the HTTP layer with `nock` — replying 200 for the success
// cases and a 4xx/5xx for the error cases — instead of asserting on the
// resolved value. See the sibling `read-site-recommendations` / `read-feeds`
// fetcher tests for the `nock( BASE ).post( … ).reply( … )` pattern.
describe( 'read spaces mutators', () => {
	it( 'creates a local read space until the create endpoint exists', async () => {
		const space = await createReadSpace( {
			name: 'Work',
			tags: [ 'business', 'design' ],
		} );

		expect( space ).toMatchObject( {
			name: 'Work',
			tags: [ 'business', 'design' ],
			layout: { color: 'blue', icon: 'category' },
			sources: [],
		} );
		expect( space.id ).toEqual( expect.any( String ) );
	} );

	it( 'resolves when adding a source until the source endpoint exists', async () => {
		await expect(
			addReadSpaceSource( { spaceId: SPACE_ID, subscription: makeSubscription() } )
		).resolves.toBeUndefined();
	} );

	it( 'resolves when deleting a source until the source endpoint exists', async () => {
		await expect(
			deleteReadSpaceSource( { spaceId: SPACE_ID, subscription: makeSubscription() } )
		).resolves.toBeUndefined();
	} );
} );
