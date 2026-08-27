/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFollowSite, useSiteSubscriptions } from 'calypso/reader/data/site-subscriptions';
import { recordFollow } from 'calypso/reader/stats';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import StarterPacks, { buildStarterPacks } from '../starter-packs';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/reader/stats', () => ( { recordFollow: jest.fn() } ) );
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useFollowSite: jest.fn(),
	useSiteSubscriptions: jest.fn(),
} ) );
jest.mock( 'calypso/blocks/site-icon', () => ( { SiteIcon: () => <span /> } ) );
jest.mock( 'react-intersection-observer', () => ( {
	useInView: () => ( { ref: jest.fn(), inView: false } ),
} ) );
jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: () => ( { data: undefined } ),
} ) );

const mockUseFollowSite = jest.mocked( useFollowSite );
const mockUseSiteSubscriptions = jest.mocked( useSiteSubscriptions );

describe( 'buildStarterPacks', () => {
	it( 'resolves every topic group to a pack with blogs', () => {
		const packs = buildStarterPacks( () => 0 );

		expect( packs.length ).toBeGreaterThan( 0 );
		packs.forEach( ( pack ) => {
			expect( pack.blogs.length ).toBeGreaterThan( 0 );
			expect( pack.blogs.length ).toBeLessThanOrEqual( 8 );
		} );
	} );
} );

describe( 'StarterPacks', () => {
	const mutateAsync = jest.fn().mockResolvedValue( {} );

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseFollowSite.mockReturnValue( { mutateAsync } as unknown as ReturnType<
			typeof useFollowSite
		> );
		mockUseSiteSubscriptions.mockReturnValue( { subscriptions: [] } as unknown as ReturnType<
			typeof useSiteSubscriptions
		> );
	} );

	it( 'follows every blog in a pack when Follow all is clicked', async () => {
		renderWithProvider( <StarterPacks /> );

		const [ firstButton ] = screen.getAllByRole( 'button', { name: /Follow all sites in/ } );
		await userEvent.click( firstButton );

		await waitFor( () => expect( mutateAsync ).toHaveBeenCalled() );
		expect( mutateAsync.mock.calls.length ).toBeLessThanOrEqual( 8 );
		expect( mutateAsync ).toHaveBeenCalledWith(
			expect.objectContaining( { source: 'reader-follow-sites-pack' } )
		);
		expect( recordFollow ).toHaveBeenCalledTimes( mutateAsync.mock.calls.length );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_follow_sites_pack_followed',
			expect.objectContaining( { blog_count: mutateAsync.mock.calls.length } )
		);
	} );

	it( 'marks a pack as following when all of its blogs are already subscribed', () => {
		const [ pack ] = buildStarterPacks( () => 0 );
		mockUseSiteSubscriptions.mockReturnValue( {
			subscriptions: pack.blogs.map( ( blog ) => ( { feed_ID: blog.feed_ID } ) ),
		} as unknown as ReturnType< typeof useSiteSubscriptions > );
		jest.spyOn( Math, 'random' ).mockReturnValue( 0 );

		renderWithProvider( <StarterPacks /> );

		expect( screen.getAllByRole( 'button', { name: /Follow all sites in/ } )[ 0 ] ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getAllByText( 'Following' ).length ).toBeGreaterThan( 0 );
	} );
} );
