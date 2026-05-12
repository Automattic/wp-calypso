/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line import/named
import { readTeamsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import wpcom from 'calypso/lib/wp';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { PostsToPodcastSection } from '../index';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn(), get: jest.fn() } },
} ) );

function renderSection( { teams = [] } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	queryClient.setQueryData( readTeamsQuery().queryKey, { teams } );
	return renderWithProvider( <PostsToPodcastSection siteId={ 1 } siteSlug="example.test" />, {
		queryClient,
	} );
}

describe( '<PostsToPodcastSection>', () => {
	it( 'renders nothing when user is not in the a8c team', () => {
		const { container } = renderSection( { teams: [ { slug: 'other' } ] } );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the form for a8c team members', () => {
		const { getByRole } = renderSection( { teams: [ { slug: 'a8c' } ] } );
		expect( getByRole( 'combobox', { name: /Window/i } ) ).toBeVisible();
		expect( getByRole( 'combobox', { name: /Length/i } ) ).toBeVisible();
		expect( getByRole( 'combobox', { name: /Voice/i } ) ).toBeVisible();
		expect( getByRole( 'button', { name: /Generate/i } ) ).toBeVisible();
	} );
} );

beforeEach( () => {
	window.localStorage.clear();
	wpcom.req.post.mockReset();
	wpcom.req.get.mockReset();
} );

describe( '<PostsToPodcastSection> — interactions', () => {
	it( 'enqueues, polls, and shows the success notice with a link to the draft', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		wpcom.req.post.mockResolvedValueOnce( { jobId: 55 } );
		wpcom.req.get.mockResolvedValueOnce( {
			status: 'complete',
			postId: 321,
			editUrl: '/post/example.test/321',
		} );

		const { getByRole, findByText } = renderSection( {
			teams: [ { slug: 'a8c' } ],
		} );

		await user.click( getByRole( 'button', { name: /Generate/i } ) );
		await act( async () => {} );

		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: '/sites/1/posts-to-podcast',
			apiNamespace: 'wpcom/v2',
			body: {
				window: { unit: 'days', n: 7 },
				length: 'medium',
				voicePreset: 'witty',
			},
		} );
		expect( await findByText( /Draft created\./ ) ).toBeVisible();
		const openButton = getByRole( 'link', { name: /Open draft/i } );
		expect( openButton ).toHaveAttribute( 'href', '/post/example.test/321' );
		jest.useRealTimers();
	} );

	it( 'shows an error notice and re-enables Generate when enqueue rejects', async () => {
		const user = userEvent.setup();
		wpcom.req.post.mockRejectedValueOnce( new Error( 'nope' ) );

		const { getByRole, findByText } = renderSection( {
			teams: [ { slug: 'a8c' } ],
		} );

		await user.click( getByRole( 'button', { name: /Generate/i } ) );

		expect( await findByText( /Generation failed/i ) ).toBeVisible();
		expect( getByRole( 'button', { name: /Generate/i } ) ).toBeEnabled();
	} );
} );
