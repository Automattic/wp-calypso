/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { SocialOverviewView } from '../social-overview-view';
import type {
	AtmosphereConnection,
	AtmosphereConnectionDetails,
	MastodonConnection,
} from '@automattic/api-core';
import type React from 'react';

// Stub `ReaderMain` to a passthrough so the test doesn't pull in
// SyncReaderFollows and the data-layer requests it triggers.
jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

// Don't fetch real timelines — the spotlight strip is not under test.
jest.mock( '../social-spotlight', () => ( {
	SocialSpotlight: () => null,
} ) );

// Fediverse is feature-flag gated; force it off so we don't have to mock
// the extra connections endpoint.
jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = ( flag: string ) => flag !== 'reader/fediverse';
	const config = ( () => undefined ) as unknown as { isEnabled: typeof isEnabled };
	config.isEnabled = isEnabled;
	return {
		__esModule: true,
		default: config,
		isEnabled,
	};
} );

const mockUseConnectionsQuery = jest.fn();
const mockUseConnectionQuery = jest.fn();
const mockUseMastodonConnectionsQuery = jest.fn();
const mockUseMastodonConnectionQuery = jest.fn();
const mockUseFediverseConnectionsQuery = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	useConnectionsQuery: () => mockUseConnectionsQuery(),
	useConnectionQuery: ( id: number | null ) => mockUseConnectionQuery( id ),
	useMastodonConnectionsQuery: () => mockUseMastodonConnectionsQuery(),
	useMastodonConnectionQuery: ( id: number | null ) => mockUseMastodonConnectionQuery( id ),
	useFediverseConnectionsQuery: () => mockUseFediverseConnectionsQuery(),
} ) );

function makeConnection( overrides: Partial< AtmosphereConnection > = {} ): AtmosphereConnection {
	return {
		id: 101,
		did: 'did:plc:alice',
		handle: 'alice.example.com',
		display_name: 'Alice',
		avatar: null,
		pds_hostname: 'pds.example.com',
		...overrides,
	};
}

function makeDetails(
	overrides: Partial< AtmosphereConnectionDetails > = {}
): AtmosphereConnectionDetails {
	return {
		did: 'did:plc:alice',
		handle: 'alice.example.com',
		display_name: 'Alice',
		description: '',
		avatar: null,
		banner: null,
		counts: { followers: 0, follows: 0, posts: 0 },
		pds_hostname: 'pds.example.com',
		...overrides,
	};
}

function makeMastodonConnection(
	overrides: Partial< MastodonConnection > = {}
): MastodonConnection {
	return {
		id: 202,
		handle: '@bob@mastodon.example',
		instance: 'mastodon.example',
		display_name: 'Bob',
		avatar: null,
		...overrides,
	};
}

beforeEach( () => {
	mockUseMastodonConnectionsQuery.mockReturnValue( {
		data: { connections: [] },
		isPending: false,
		isError: false,
	} );
	mockUseMastodonConnectionQuery.mockReturnValue( { data: undefined } );
	mockUseFediverseConnectionsQuery.mockReturnValue( {
		data: { connections: [] },
		isPending: false,
		isError: false,
	} );
} );

afterEach( () => {
	jest.clearAllMocks();
} );

describe( 'SocialOverviewView — ATmosphere PDS hostname', () => {
	it( 'renders the PDS hostname for a custom PDS connection', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: 'pds.example.com' } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: 'pds.example.com' } ),
		} );

		render( <SocialOverviewView /> );

		expect( screen.getByText( 'pds.example.com' ) ).toBeVisible();
	} );

	it( 'hides the PDS hostname when the connection is on bsky.social', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: {
				connections: [
					makeConnection( { handle: 'alice.bsky.social', pds_hostname: 'bsky.social' } ),
				],
			},
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { handle: 'alice.bsky.social', pds_hostname: 'bsky.social' } ),
		} );

		render( <SocialOverviewView /> );

		expect( screen.queryByText( 'bsky.social' ) ).not.toBeInTheDocument();
	} );

	it( 'hides the PDS line when pds_hostname is null', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: null } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: null } ),
		} );

		const { container } = render( <SocialOverviewView /> );

		expect( container.querySelector( '.social-card__pds' ) ).toBeNull();
	} );

	it( 'falls back to the list value when the per-id query has not resolved yet', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: 'pds.example.com' } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( { data: undefined } );

		render( <SocialOverviewView /> );

		expect( screen.getByText( 'pds.example.com' ) ).toBeVisible();
	} );

	// Pins the inline-comment claim that an undefined details field
	// must not erase the list value — separate from the `data: undefined`
	// case above, since that one would also pass with inverted precedence.
	it( 'keeps the list value when details has resolved but omits pds_hostname', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: 'pds.example.com' } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: undefined } ),
		} );

		render( <SocialOverviewView /> );

		expect( screen.getByText( 'pds.example.com' ) ).toBeVisible();
	} );

	// Pre-CM-739 connections: the list endpoint hasn't been backfilled,
	// so it returns `null`, but getConnection(id) resolves the PDS.
	it( 'uses the details value when the list value is null', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: null } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: 'pds.example.com' } ),
		} );

		render( <SocialOverviewView /> );

		expect( screen.getByText( 'pds.example.com' ) ).toBeVisible();
	} );

	it( 'hides the PDS line when pds_hostname is an empty string', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: '' } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: '' } ),
		} );

		const { container } = render( <SocialOverviewView /> );

		expect( container.querySelector( '.social-card__pds' ) ).toBeNull();
	} );

	// A padded value would otherwise pass `!!pdsHostname` and slip past the
	// default-host check, rendering a visually-blank pill in production.
	it( 'hides the PDS line when pds_hostname is whitespace-only', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeConnection( { pds_hostname: '   ' } ) ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: '   ' } ),
		} );

		const { container } = render( <SocialOverviewView /> );

		expect( container.querySelector( '.social-card__pds' ) ).toBeNull();
	} );

	it( 'normalizes casing and whitespace so a padded default still hides', () => {
		mockUseConnectionsQuery.mockReturnValue( {
			data: {
				connections: [
					makeConnection( { handle: 'alice.bsky.social', pds_hostname: ' BSKY.social ' } ),
				],
			},
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { handle: 'alice.bsky.social', pds_hostname: ' BSKY.social ' } ),
		} );

		const { container } = render( <SocialOverviewView /> );

		expect( container.querySelector( '.social-card__pds' ) ).toBeNull();
	} );

	it( 'never renders a PDS line for non-ATmosphere cards', () => {
		const atmosphereConnection = makeConnection( {
			id: 101,
			handle: 'alice.example.com',
			pds_hostname: 'pds.example.com',
		} );
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ atmosphereConnection ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockReturnValue( {
			data: makeDetails( { pds_hostname: 'pds.example.com' } ),
		} );
		mockUseMastodonConnectionsQuery.mockReturnValue( {
			data: { connections: [ makeMastodonConnection() ] },
			isPending: false,
			isError: false,
		} );

		const { container } = render( <SocialOverviewView /> );

		const atmosphereCard = container.querySelector( '.social-card--atmosphere' );
		const mastodonCard = container.querySelector( '.social-card--mastodon' );
		expect( atmosphereCard?.querySelector( '.social-card__pds' ) ).not.toBeNull();
		expect( mastodonCard?.querySelector( '.social-card__pds' ) ).toBeNull();
	} );

	// The per-id details query is parameterized by id: each card must see
	// the details for *its own* connection. A refactor that hoisted the
	// query out of the per-card render (or captured the wrong id in a
	// closure) would silently merge both cards' state.
	it( 'wires the per-id details query to each card individually', () => {
		const aliceCustom = makeConnection( {
			id: 101,
			handle: 'alice.example.com',
			pds_hostname: 'pds.example.com',
		} );
		const bobDefault = makeConnection( {
			id: 202,
			did: 'did:plc:bob',
			handle: 'bob.bsky.social',
			pds_hostname: 'bsky.social',
		} );
		mockUseConnectionsQuery.mockReturnValue( {
			data: { connections: [ aliceCustom, bobDefault ] },
			isPending: false,
			isError: false,
		} );
		mockUseConnectionQuery.mockImplementation( ( id: number | null ) => {
			if ( id === 101 ) {
				return {
					data: makeDetails( {
						did: 'did:plc:alice',
						handle: 'alice.example.com',
						pds_hostname: 'pds.example.com',
					} ),
				};
			}
			if ( id === 202 ) {
				return {
					data: makeDetails( {
						did: 'did:plc:bob',
						handle: 'bob.bsky.social',
						pds_hostname: 'bsky.social',
					} ),
				};
			}
			return { data: undefined };
		} );

		const { container } = render( <SocialOverviewView /> );

		const pdsLines = container.querySelectorAll( '.social-card__pds' );
		expect( pdsLines ).toHaveLength( 1 );
		expect( pdsLines[ 0 ].textContent ).toBe( 'pds.example.com' );
	} );
} );
