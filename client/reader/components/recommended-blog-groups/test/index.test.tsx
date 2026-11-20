/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { RecommendedBlogGroups } from '../index';
import type {
	RecommendedBlog,
	RecommendedBlogGroup,
} from 'calypso/reader/onboarding-rsm/recommended-blogs';

const mockSubscribedFeedIds = new Set< number >();
const mockFollow = jest.fn();
const mockUnfollow = jest.fn();

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useIsSubscribed: ( { feedId }: { feedId: number } ) => mockSubscribedFeedIds.has( feedId ),
	useFollowSite: () => ( { mutateAsync: mockFollow } ),
	useUnfollowSite: () => ( { mutateAsync: mockUnfollow } ),
} ) );

const mockLatestPostDate = jest.fn< Date | null, [ { feed_ID?: number | null } ] >( () => null );

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs/use-latest-post-date', () => ( {
	useLatestPostDate: ( blog: { feed_ID?: number | null } ) => mockLatestPostDate( blog ),
} ) );

const blog = ( feedId: number, name: string ): RecommendedBlog => ( {
	feed_ID: feedId,
	site_ID: 0,
	name,
	site_URL: `https://www.${ name.toLowerCase().replace( / /g, '' ) }.example/`,
	feed_URL: `https://${ name.toLowerCase().replace( / /g, '' ) }.example/feed`,
	icon_URL: `https://${ name.toLowerCase().replace( / /g, '' ) }.example/icon.png`,
	description: `${ name } writes about things.`,
} );

const groups: RecommendedBlogGroup[] = [
	{ key: 'food', title: 'Food', blogs: [ blog( 1, 'Pasta Daily' ), blog( 2, 'Bread Notes' ) ] },
	{ key: 'music', title: 'Music', blogs: [ blog( 3, 'Loud Songs' ) ] },
];

const getPill = ( name: string ) =>
	screen.getByRole( 'button', { name: new RegExp( `^${ name }` ) } );

beforeEach( () => {
	mockSubscribedFeedIds.clear();
	mockFollow.mockClear();
	mockUnfollow.mockClear();
	mockLatestPostDate.mockReset();
	mockLatestPostDate.mockReturnValue( null );
} );

describe( 'RecommendedBlogGroups in select mode', () => {
	const renderSelect = (
		props: Partial< React.ComponentProps< typeof RecommendedBlogGroups > > = {}
	) => {
		const onToggle = jest.fn();
		const onBlogHidden = jest.fn();
		renderWithProvider(
			<RecommendedBlogGroups
				mode="select"
				groups={ groups }
				selectedFeedIds={ new Set( [ 2 ] ) }
				onToggle={ onToggle }
				onBlogHidden={ onBlogHidden }
				{ ...( props as object ) }
			/>
		);
		return { onToggle, onBlogHidden };
	};

	it( 'shows each interest with its blogs as pills', () => {
		renderSelect();

		const food = screen.getByRole( 'region', { name: 'Food' } );
		expect( within( food ).getByRole( 'heading', { name: 'Food' } ) ).toBeVisible();
		expect( within( food ).getAllByRole( 'listitem' ) ).toHaveLength( 2 );
		expect(
			within( screen.getByRole( 'region', { name: 'Music' } ) ).getByText( 'Loud Songs' )
		).toBeVisible();
	} );

	it( 'marks selected blogs as pressed and toggles a blog on click', async () => {
		const user = userEvent.setup();
		const { onToggle } = renderSelect();

		expect( getPill( 'Bread Notes' ) ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( getPill( 'Pasta Daily' ) ).toHaveAttribute( 'aria-pressed', 'false' );

		await user.click( getPill( 'Pasta Daily' ) );

		expect( onToggle ).toHaveBeenCalledWith( groups[ 0 ].blogs[ 0 ] );
	} );

	it( 'shows a blog the reader already follows as selected and not toggleable', async () => {
		mockSubscribedFeedIds.add( 3 );
		const user = userEvent.setup();
		const { onToggle } = renderSelect();

		const pill = getPill( 'Loud Songs' );
		expect( pill ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( pill ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( pill ).toHaveTextContent( 'Already subscribed' );

		await user.click( pill );

		expect( onToggle ).not.toHaveBeenCalled();
	} );

	it( 'ignores clicks while disabled', async () => {
		const user = userEvent.setup();
		const { onToggle } = renderSelect( { disabled: true } );

		await user.click( getPill( 'Pasta Daily' ) );

		expect( onToggle ).not.toHaveBeenCalled();
	} );

	it( 'hides a blog whose icon fails to load, and an interest left empty', () => {
		const { onBlogHidden } = renderSelect();
		const icon = ( name: string ) => getPill( name ).querySelector( 'img' ) as HTMLImageElement;

		fireEvent.error( icon( 'Loud Songs' ) );

		expect( screen.queryByText( 'Loud Songs' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'region', { name: 'Music' } ) ).not.toBeInTheDocument();
		expect( onBlogHidden ).toHaveBeenCalledWith( groups[ 1 ].blogs[ 0 ] );
		expect( screen.getByText( 'Pasta Daily' ) ).toBeVisible();
	} );

	it( 'shows the description, domain and latest post date when a pill gets focus', async () => {
		mockLatestPostDate.mockReturnValue( new Date( '2026-11-18T10:00:00Z' ) );
		const user = userEvent.setup();
		renderSelect();

		await user.tab();

		expect( getPill( 'Pasta Daily' ) ).toHaveFocus();
		await waitFor( () =>
			expect( screen.getByText( 'Pasta Daily writes about things.' ) ).toBeVisible()
		);
		expect( screen.getByText( 'pastadaily.example' ) ).toBeVisible();
		expect( screen.getByText( 'Latest post: Nov 18, 2026' ) ).toBeVisible();
		expect( getPill( 'Pasta Daily' ) ).toHaveAccessibleDescription(
			expect.stringContaining( 'Pasta Daily writes about things.' )
		);

		await user.keyboard( '{Escape}' );

		expect( screen.queryByText( 'Pasta Daily writes about things.' ) ).not.toBeInTheDocument();
	} );

	it( 'shows no date when the latest post date is unknown', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.hover( getPill( 'Bread Notes' ) );

		await waitFor( () =>
			expect( screen.getByText( 'Bread Notes writes about things.' ) ).toBeVisible()
		);
		expect( screen.queryByText( /Latest post/ ) ).not.toBeInTheDocument();

		await user.unhover( getPill( 'Bread Notes' ) );

		expect( screen.queryByText( 'Bread Notes writes about things.' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the details open while the pill has focus, after the pointer leaves', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.tab();
		await user.hover( getPill( 'Pasta Daily' ) );
		await user.unhover( getPill( 'Pasta Daily' ) );

		expect( getPill( 'Pasta Daily' ) ).toHaveFocus();
		await waitFor( () =>
			expect( screen.getByText( 'Pasta Daily writes about things.' ) ).toBeVisible()
		);
		expect( getPill( 'Pasta Daily' ) ).toHaveAccessibleDescription(
			expect.stringContaining( 'Pasta Daily writes about things.' )
		);
	} );

	it( 'keeps the details open while hovered, after the pill loses focus', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.hover( getPill( 'Bread Notes' ) );
		getPill( 'Bread Notes' ).focus();
		getPill( 'Bread Notes' ).blur();

		await waitFor( () =>
			expect( screen.getByText( 'Bread Notes writes about things.' ) ).toBeVisible()
		);
	} );

	it( 'hides the details on Escape until the pill is hovered or focused again', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.hover( getPill( 'Pasta Daily' ) );
		await user.tab();
		expect( getPill( 'Pasta Daily' ) ).toHaveFocus();
		await waitFor( () =>
			expect( screen.getByText( 'Pasta Daily writes about things.' ) ).toBeVisible()
		);

		await user.keyboard( '{Escape}' );

		expect( screen.queryByText( 'Pasta Daily writes about things.' ) ).not.toBeInTheDocument();
		expect( getPill( 'Pasta Daily' ) ).not.toHaveAttribute( 'aria-describedby' );

		await user.unhover( getPill( 'Pasta Daily' ) );
		await user.hover( getPill( 'Pasta Daily' ) );

		await waitFor( () =>
			expect( screen.getByText( 'Pasta Daily writes about things.' ) ).toBeVisible()
		);
	} );

	it( 'closes details opened from the info button when the pointer leaves', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.click( screen.getByRole( 'button', { name: 'About Loud Songs' } ) );
		await waitFor( () =>
			expect( screen.getByText( 'Loud Songs writes about things.' ) ).toBeVisible()
		);

		await user.unhover( getPill( 'Loud Songs' ) );

		expect( screen.queryByText( 'Loud Songs writes about things.' ) ).not.toBeInTheDocument();
	} );

	it( 'does not open the details when a touch selects a pill', async () => {
		const user = userEvent.setup();
		const { onToggle } = renderSelect();

		await user.pointer( [
			{ keys: '[TouchA]', target: getPill( 'Loud Songs' ) },
			{ keys: '[/TouchA]', target: getPill( 'Loud Songs' ) },
		] );

		expect( onToggle ).toHaveBeenCalledWith( groups[ 1 ].blogs[ 0 ] );
		expect( screen.queryByText( 'Loud Songs writes about things.' ) ).not.toBeInTheDocument();
	} );

	it( 'toggles the details from the info button on touch, and closes them on a tap elsewhere', async () => {
		const user = userEvent.setup();
		renderSelect();
		const info = screen.getByRole( 'button', { name: 'About Loud Songs' } );
		const tap = ( target: Element ) =>
			user.pointer( [
				{ keys: '[TouchA]', target },
				{ keys: '[/TouchA]', target },
			] );

		await tap( info );
		await waitFor( () =>
			expect( screen.getByText( 'Loud Songs writes about things.' ) ).toBeVisible()
		);

		await tap( info );
		expect( screen.queryByText( 'Loud Songs writes about things.' ) ).not.toBeInTheDocument();

		await tap( info );
		await waitFor( () =>
			expect( screen.getByText( 'Loud Songs writes about things.' ) ).toBeVisible()
		);

		await tap( screen.getByRole( 'heading', { name: 'Food' } ) );
		expect( screen.queryByText( 'Loud Songs writes about things.' ) ).not.toBeInTheDocument();
	} );

	it( 'closes the details of a clicked pill once the pointer moves on', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.hover( getPill( 'Loud Songs' ) );

		expect( getPill( 'Pasta Daily' ) ).toHaveFocus();
		expect( screen.queryByText( 'Pasta Daily writes about things.' ) ).not.toBeInTheDocument();
		await waitFor( () =>
			expect( screen.getByText( 'Loud Songs writes about things.' ) ).toBeVisible()
		);
	} );

	it( 'opens the details on keyboard focus after the pill was clicked while focused', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.tab();
		await user.click( getPill( 'Pasta Daily' ) );
		await user.tab();
		await user.tab( { shift: true } );

		expect( getPill( 'Pasta Daily' ) ).toHaveFocus();
		await waitFor( () =>
			expect( screen.getByText( 'Pasta Daily writes about things.' ) ).toBeVisible()
		);
	} );

	it( 'gives each blog a single tab stop', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.tab();
		expect( getPill( 'Pasta Daily' ) ).toHaveFocus();
		await user.tab();
		expect( getPill( 'Bread Notes' ) ).toHaveFocus();
		await user.tab();
		expect( getPill( 'Loud Songs' ) ).toHaveFocus();
	} );

	it( 'opens the details from the info button, for touch screens', async () => {
		const user = userEvent.setup();
		renderSelect();

		await user.click( screen.getByRole( 'button', { name: 'About Loud Songs' } ) );

		await waitFor( () =>
			expect( screen.getByText( 'Loud Songs writes about things.' ) ).toBeVisible()
		);
	} );
} );

describe( 'RecommendedBlogGroups in follow mode', () => {
	it( 'follows a blog the reader does not follow yet', async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<RecommendedBlogGroups mode="follow" groups={ groups } followSource="test-source" />
		);

		await user.click( getPill( 'Pasta Daily' ) );

		expect( mockFollow ).toHaveBeenCalledWith( {
			feedUrl: 'https://pastadaily.example/feed',
			source: 'test-source',
		} );
		expect( mockUnfollow ).not.toHaveBeenCalled();
	} );

	it( 'unfollows a blog the reader already follows', async () => {
		mockSubscribedFeedIds.add( 1 );
		const user = userEvent.setup();
		renderWithProvider( <RecommendedBlogGroups mode="follow" groups={ groups } /> );

		expect( getPill( 'Pasta Daily' ) ).toHaveAttribute( 'aria-pressed', 'true' );

		await user.click( getPill( 'Pasta Daily' ) );

		expect( mockUnfollow ).toHaveBeenCalledWith( {
			feedUrl: 'https://pastadaily.example/feed',
			source: undefined,
		} );
	} );
} );
