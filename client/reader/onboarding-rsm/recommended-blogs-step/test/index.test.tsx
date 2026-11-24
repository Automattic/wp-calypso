/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { RecommendedBlogsStep } from '../index';
import type {
	RecommendedBlog,
	RecommendedBlogGroup,
} from 'calypso/reader/onboarding-rsm/recommended-blogs';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockFollowedTags = jest.fn();

jest.mock( 'calypso/reader/data/tags', () => ( {
	useFollowedTags: () => mockFollowedTags(),
} ) );

const mockFollowSite = jest.fn();

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	useIsSubscribed: () => false,
	useFollowSite: () => ( { mutateAsync: mockFollowSite } ),
	useUnfollowSite: () => ( { mutate: jest.fn(), isPending: false } ),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs/use-latest-post-date', () => ( {
	useLatestPostDate: () => null,
} ) );

const mockGroups = jest.fn< RecommendedBlogGroup[], [ readonly string[] ] >();

jest.mock( 'calypso/reader/onboarding-rsm/recommended-blogs/groups', () => ( {
	getRecommendedBlogGroups: ( tags: readonly string[] ) => mockGroups( tags ),
} ) );

jest.mock( 'calypso/reader/onboarding-rsm/subscribe-modal/verificationNudge', () => ( {
	__esModule: true,
	default: () => <p>Verify your email to subscribe.</p>,
} ) );

const blog = ( feedId: number, name: string ): RecommendedBlog => ( {
	feed_ID: feedId,
	site_ID: 0,
	name,
	site_URL: `https://blog-${ feedId }.example/`,
	feed_URL: `https://blog-${ feedId }.example/feed`,
	icon_URL: `https://blog-${ feedId }.example/icon.png`,
	description: `${ name } writes about things.`,
} );

const groups: RecommendedBlogGroup[] = [
	{ key: 'food', title: 'Food', blogs: [ blog( 1, 'Pasta Daily' ), blog( 2, 'Bread Notes' ) ] },
	{ key: 'music', title: 'Music', blogs: [ blog( 3, 'Loud Songs' ) ] },
];

const getPill = ( name: string ) =>
	screen.getByRole( 'button', { name: new RegExp( `^${ name }` ) } );

const renderStep = ( promptVerification = false ) => {
	const onFinish = jest.fn();
	const { rerender, unmount } = renderWithProvider(
		<RecommendedBlogsStep onFinish={ onFinish } promptVerification={ promptVerification } />
	);
	return { onFinish, rerender, unmount };
};

const deferred = () => {
	let resolve: ( value: unknown ) => void = () => {};
	const promise = new Promise( ( done ) => {
		resolve = done;
	} );
	return { promise, resolve };
};

beforeEach( () => {
	jest.mocked( recordTracksEvent ).mockClear();
	mockFollowSite.mockReset();
	mockFollowSite.mockResolvedValue( {} );
	mockFollowedTags.mockReturnValue( {
		data: [ { slug: 'music' }, { slug: 'food' } ],
		isLoading: false,
	} );
	mockGroups.mockReturnValue( groups );
} );

describe( 'RecommendedBlogsStep', () => {
	it( 'shows the recommendations for the reader’s followed tags', () => {
		renderStep();

		expect( mockGroups ).toHaveBeenCalledWith( [ 'music', 'food' ] );
		expect( screen.getByRole( 'heading', { name: 'Find your next favorite blog' } ) ).toBeVisible();
		expect( screen.getByRole( 'region', { name: 'Food' } ) ).toBeVisible();
		expect( screen.getByRole( 'region', { name: 'Music' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeEnabled();
	} );

	it( 'shows a message and lets the reader continue when no recommendations apply', async () => {
		mockGroups.mockReturnValue( [] );
		const user = userEvent.setup();
		const { onFinish } = renderStep();

		expect(
			screen.getByText( /We don’t have blog recommendations for your interests yet/ )
		).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( onFinish ).toHaveBeenCalledTimes( 1 );
		expect( mockFollowSite ).not.toHaveBeenCalled();
	} );

	it( 'shows no recommendations while the followed tags load', () => {
		mockFollowedTags.mockReturnValue( { data: undefined, isLoading: true } );
		renderStep();

		expect( screen.queryByRole( 'region' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /We don’t have blog recommendations/ ) ).not.toBeInTheDocument();
	} );

	it( 'counts the selected blogs and lets the reader deselect one', async () => {
		const user = userEvent.setup();
		renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( getPill( 'Loud Songs' ) );

		expect( screen.getByText( '2 blogs selected' ) ).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Subscribe to 2 blogs and continue' } )
		).toBeVisible();

		await user.click( getPill( 'Pasta Daily' ) );

		expect( screen.getByText( '1 blog selected' ) ).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Subscribe to 1 blog and continue' } )
		).toBeVisible();
	} );

	it( 'follows every selected blog on Continue, then finishes', async () => {
		const user = userEvent.setup();
		const { onFinish } = renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( getPill( 'Loud Songs' ) );
		await user.click( screen.getByRole( 'button', { name: 'Subscribe to 2 blogs and continue' } ) );

		expect( mockFollowSite ).toHaveBeenCalledTimes( 2 );
		expect( mockFollowSite ).toHaveBeenCalledWith( {
			feedUrl: 'https://blog-1.example/feed',
			source: 'reader-onboarding',
		} );
		expect( mockFollowSite ).toHaveBeenCalledWith( {
			feedUrl: 'https://blog-3.example/feed',
			source: 'reader-onboarding',
		} );
		expect( onFinish ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_onboarding_recommended_blogs_followed',
			{ selected_count: 2, failed_count: 0 }
		);
	} );

	it( 'finishes with the latest onFinish, which carries the counts after the follows', async () => {
		const follow = deferred();
		mockFollowSite.mockReturnValue( follow.promise );
		const user = userEvent.setup();
		const { onFinish, rerender } = renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( screen.getByRole( 'button', { name: 'Subscribe to 1 blog and continue' } ) );
		const latestOnFinish = jest.fn();
		rerender( <RecommendedBlogsStep onFinish={ latestOnFinish } promptVerification={ false } /> );
		await act( async () => follow.resolve( {} ) );

		expect( latestOnFinish ).toHaveBeenCalledTimes( 1 );
		expect( onFinish ).not.toHaveBeenCalled();
	} );

	it( 'does not finish onboarding when the reader leaves the step during the follows', async () => {
		const follow = deferred();
		mockFollowSite.mockReturnValue( follow.promise );
		const user = userEvent.setup();
		const { onFinish, unmount } = renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( screen.getByRole( 'button', { name: 'Subscribe to 1 blog and continue' } ) );
		unmount();
		await act( async () => follow.resolve( {} ) );

		expect( onFinish ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_onboarding_recommended_blogs_followed',
			{ selected_count: 1, failed_count: 0 }
		);
	} );

	it( 'keeps the blogs that failed selected so the reader can retry', async () => {
		mockFollowSite.mockImplementation( ( { feedUrl }: { feedUrl: string } ) =>
			feedUrl === 'https://blog-3.example/feed'
				? Promise.reject( new Error( 'failed' ) )
				: Promise.resolve( {} )
		);
		const user = userEvent.setup();
		const { onFinish } = renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( getPill( 'Loud Songs' ) );
		await user.click( screen.getByRole( 'button', { name: 'Subscribe to 2 blogs and continue' } ) );

		expect( onFinish ).not.toHaveBeenCalled();
		expect(
			await screen.findByText( 'We couldn’t subscribe you to 1 blog. Try again, or skip for now.', {
				ignore: '.a11y-speak-region, script, style',
			} )
		).toBeVisible();
		expect( screen.getByText( '1 blog selected' ) ).toBeVisible();
		expect( getPill( 'Loud Songs' ) ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( getPill( 'Pasta Daily' ) ).toHaveAttribute( 'aria-pressed', 'false' );

		mockFollowSite.mockReset();
		mockFollowSite.mockResolvedValue( {} );
		await user.click( screen.getByRole( 'button', { name: 'Subscribe to 1 blog and continue' } ) );

		expect( mockFollowSite ).toHaveBeenCalledTimes( 1 );
		expect( mockFollowSite ).toHaveBeenCalledWith( {
			feedUrl: 'https://blog-3.example/feed',
			source: 'reader-onboarding',
		} );
		expect( onFinish ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'finishes without following anything on Skip', async () => {
		const user = userEvent.setup();
		const { onFinish } = renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( screen.getByRole( 'button', { name: 'Skip for now' } ) );

		expect( mockFollowSite ).not.toHaveBeenCalled();
		expect( onFinish ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_onboarding_recommended_blogs_skipped',
			{ selected_count: 1 }
		);
	} );

	it( 'drops a selected blog whose icon fails to load', async () => {
		const user = userEvent.setup();
		renderStep();

		await user.click( getPill( 'Pasta Daily' ) );
		await user.click( getPill( 'Loud Songs' ) );
		fireEvent.error( getPill( 'Loud Songs' ).querySelector( 'img' ) as HTMLImageElement );

		expect( screen.getByText( '1 blog selected' ) ).toBeVisible();
	} );

	it( 'asks for email verification and blocks the step until then', () => {
		renderStep( true );

		expect( screen.getByText( 'Verify your email to subscribe.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByRole( 'button', { name: 'Skip for now' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );
} );
