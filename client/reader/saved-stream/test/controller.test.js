import { readTeamsQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { QueryClient } from '@tanstack/react-query';
import { requireSavedPosts } from '../controller';

let mockSavedPostsEnabled = false;
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: ( flag ) => flag === 'reader/saved-posts' && mockSavedPostsEnabled,
} ) );
jest.mock( 'calypso/reader/controller-helper', () => ( {} ) );
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

const A8C_TEAM = { slug: 'a8c', title: 'Automattic' };

function makeContext( teams ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	if ( teams ) {
		queryClient.setQueryData( readTeamsQuery().queryKey, { number: teams.length, teams } );
	} else {
		jest.spyOn( queryClient, 'fetchQuery' ).mockRejectedValue( new Error( 'Not logged in' ) );
	}
	return { queryClient };
}

describe( 'requireSavedPosts', () => {
	beforeEach( () => {
		mockSavedPostsEnabled = false;
		page.redirect.mockClear();
	} );

	it( 'lets everyone through once the feature is on', async () => {
		mockSavedPostsEnabled = true;
		const next = jest.fn();

		await requireSavedPosts( makeContext( [] ), next );

		expect( next ).toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'lets an Automattician through while the feature is off', async () => {
		const next = jest.fn();

		await requireSavedPosts( makeContext( [ A8C_TEAM ] ), next );

		expect( next ).toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'someone outside Automattic', [ { slug: 'other', title: 'Other' } ] ],
		[ 'a user whose teams fail to load', undefined ],
	] )( 'sends %s to the Reader while the feature is off', async ( _who, teams ) => {
		const next = jest.fn();

		await requireSavedPosts( makeContext( teams ), next );

		expect( next ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
	} );
} );
