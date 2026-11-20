/**
 * @jest-environment jsdom
 */
import page, { type Context } from '@automattic/calypso-router';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { forwardStudioHomeLink } from '../home-forward';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const contextFor = ( site: string, query: Record< string, string > = {} ) =>
	( { params: { site }, query } ) as unknown as Context;

describe( 'forwardStudioHomeLink', () => {
	let next: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		next = jest.fn();
	} );

	it( 'forwards a Studio link to the sync-connect page with its params', () => {
		forwardStudioHomeLink(
			contextFor( '123', { studioSiteId: 'abc', autoOpenPush: 'true' } ),
			next
		);

		expect( page.redirect ).toHaveBeenCalledWith(
			'/checkout/studio-return?studioSiteId=abc&remoteSiteId=123&autoOpenPush=true'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_studio_sync_home_forward', {
			blog_id: 123,
		} );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'leaves a site slug to My Home, since the flow always used the blog ID', () => {
		forwardStudioHomeLink( contextFor( 'example.wordpress.com', { studioSiteId: 'abc' } ), next );

		expect( page.redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'leaves an ordinary /home link alone', () => {
		forwardStudioHomeLink( contextFor( '123' ), next );

		expect( page.redirect ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
