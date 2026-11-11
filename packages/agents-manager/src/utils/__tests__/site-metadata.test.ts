jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn(), dispatch: jest.fn() } ) );

import { dispatch, select } from '@wordpress/data';
import { getSiteMetadata, replaceSiteMetadata, setSiteMetadata } from '../site-metadata';

const editEntityRecord = jest.fn();
const setProviderMetadata = jest.fn();

/**
 * Serves `site` with the given `big_sky_site_metadata`, or nothing at all, and
 * Big Sky's store with `provider`.
 */
function withSiteRecord( metadata?: unknown, provider: Record< string, unknown > = {} ) {
	( select as jest.Mock ).mockImplementation( ( storeName: unknown ) => {
		if ( storeName === 'ai-assembler' ) {
			return { getSiteMetadata: () => provider };
		}

		return metadata === undefined
			? { getEditedEntityRecord: () => false }
			: { getEditedEntityRecord: () => ( { big_sky_site_metadata: metadata } ) };
	} );
	( dispatch as jest.Mock ).mockImplementation( ( storeName: unknown ) =>
		storeName === 'ai-assembler' ? { setSiteMetadata: setProviderMetadata } : { editEntityRecord }
	);
}

/** The metadata JSON the last write sent. */
const writtenMetadata = () =>
	JSON.parse( editEntityRecord.mock.calls.at( -1 )[ 3 ].big_sky_site_metadata );

beforeEach( () => jest.clearAllMocks() );

describe( 'getSiteMetadata', () => {
	it.each( [
		{ case: 'a JSON string', stored: '{"personality":"bold"}', expected: { personality: 'bold' } },
		{
			case: 'an already-parsed object',
			stored: { personality: 'bold' },
			expected: { personality: 'bold' },
		},
		{ case: 'an unset setting', stored: '', expected: {} },
		{ case: 'malformed JSON', stored: '{ not json', expected: {} },
	] )( 'reads $case', ( { stored, expected } ) => {
		withSiteRecord( stored );

		expect( getSiteMetadata() ).toEqual( expected );
	} );

	// `{}` would read as "no metadata" and make the next write a wipe.
	it( 'is undefined, not empty, when the site record is unreadable', () => {
		withSiteRecord();

		expect( getSiteMetadata() ).toBeUndefined();
	} );
} );

describe( 'setSiteMetadata', () => {
	it( 'merges onto the stored value instead of replacing it', () => {
		withSiteRecord( '{"personality":"bold","siteLocation":{"name":"Lisbon"}}' );

		setSiteMetadata( { personality: 'playful' } );

		expect( writtenMetadata() ).toEqual( {
			personality: 'playful',
			siteLocation: { name: 'Lisbon' },
		} );
	} );

	it( 'drops the runtime-only mode key, and returns what it stored', () => {
		withSiteRecord( '{"mode":"editor","personality":"bold"}' );

		const stored = setSiteMetadata( { personality: 'playful' } );

		expect( writtenMetadata() ).toEqual( { personality: 'playful' } );
		expect( stored ).toEqual( { personality: 'playful' } );
	} );

	// Dropped at the save, a change to it would still be reported as applied.
	it( 'refuses a change to the runtime-only mode key', () => {
		withSiteRecord( '{}' );

		expect( () => setSiteMetadata( { mode: 'editor' } ) ).toThrow( 'cannot be set' );
	} );

	// Pending, like the user's own edits: the editor's Save persists it.
	it( 'writes only its own field, as a pending edit', () => {
		withSiteRecord( '{}' );

		setSiteMetadata( { personality: 'bold' } );

		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			{ big_sky_site_metadata: '{"personality":"bold"}' },
			{ undoIgnore: true }
		);
	} );

	// Big Sky rebuilds this field from its own store, so a write it never saw
	// would be undone by its next one.
	it( "keeps Big Sky's copy in step", () => {
		withSiteRecord( '{"personality":"bold"}' );

		setSiteMetadata( { siteLocation: { name: 'Lisbon' } } );

		expect( setProviderMetadata ).toHaveBeenCalledWith( {
			personality: 'bold',
			siteLocation: { name: 'Lisbon' },
		} );
	} );

	// Merging onto `{}` would silently drop every stored key.
	it( 'refuses to write when the current value cannot be read', () => {
		withSiteRecord();

		expect( () => setSiteMetadata( { personality: 'bold' } ) ).toThrow( 'unavailable' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );

describe( 'replaceSiteMetadata', () => {
	// Big Sky's reducer merges, so a key this write drops has to be sent as
	// `undefined` or its next write would bring it back. Its runtime key stays.
	it( "clears a dropped key from Big Sky's copy", () => {
		withSiteRecord( '{}', {
			personality: 'bold',
			siteLocation: { name: 'Lisbon' },
			mode: 'editor',
		} );

		replaceSiteMetadata( { personality: 'bold' } );

		expect( setProviderMetadata.mock.calls[ 0 ][ 0 ] ).toStrictEqual( {
			personality: 'bold',
			siteLocation: undefined,
		} );
	} );
} );
