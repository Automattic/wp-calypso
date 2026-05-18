/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { SocialOverviewView } from '../social-overview-view';
import type { AtmosphereConnection, AtmosphereConnectionDetails } from '@automattic/api-core';
import type React from 'react';

// `ReaderMain` mounts `<sync-reader-follows>`, which selects from a Redux
// branch the test store doesn't seed. Stub it to a passthrough.
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
} );
