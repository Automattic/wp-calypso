/**
 * Internal dependencies
 */
import { isLoaded, getByDomain, getBySite } from '../selectors';
import assert from 'assert';

describe( 'selectors', () => {
	describe( '#isLoaded()', () => {
		it( 'should return the value', () => {
			assert( isLoaded( { googleAppsUsers: { loaded: false } } ) === false );
		} );
	} );
	const getState = () => (
		{
			googleAppsUsers: {
				items: [
					{ email: 'hello@world.com', domain: 'world.com', site_id: 1 },
					{ email: 'me@example.com', domain: 'example.com', site_id: 1 },
					{ email: 'hi@world.com', domain: 'world.com', site_id: 1 },
					{ email: 'test@goofy.com', domain: 'goofy.com', site_id: 999 }
				]
			}
		}
	);
	describe( '#getByDomain(domainName)', () => {
		it( 'should filter the items by their domain property', () => {
			assert.deepEqual(
				getByDomain( getState(), 'world.com' ),
				[
					{ email: 'hello@world.com', domain: 'world.com', site_id: 1 },
					{ email: 'hi@world.com', domain: 'world.com', site_id: 1 }
				]
			);
		} );
	} );
	describe( '#getBySite(siteId)', () => {
		assert.deepEqual(
			getBySite( getState(), 999 ),
			[
				{ email: 'test@goofy.com', domain: 'goofy.com', site_id: 999 }
			]
		);
	} );
} );
