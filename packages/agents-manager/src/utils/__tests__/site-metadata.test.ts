jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/data', () => ( { select: jest.fn(), dispatch: jest.fn() } ) );

import { dispatch, select } from '@wordpress/data';
import { getSiteMetadata, setSiteMetadata } from '../site-metadata';

const editEntityRecord = jest.fn();
const saveSpecifiedEntityEdits = jest.fn();

/** Serves `site` with the given `big_sky_site_metadata`, or nothing at all. */
function withSiteRecord( metadata?: unknown ) {
	( select as jest.Mock ).mockReturnValue(
		metadata === undefined
			? { getEditedEntityRecord: () => false }
			: { getEditedEntityRecord: () => ( { big_sky_site_metadata: metadata } ) }
	);
	( dispatch as jest.Mock ).mockReturnValue( {
		editEntityRecord,
		__experimentalSaveSpecifiedEntityEdits: saveSpecifiedEntityEdits,
	} );
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
	it( 'is undefined, not empty, when the site record is unreadable', async () => {
		withSiteRecord();

		expect( getSiteMetadata() ).toBeUndefined();
	} );
} );

describe( 'setSiteMetadata', () => {
	it( 'merges onto the stored value instead of replacing it', async () => {
		withSiteRecord( '{"personality":"bold","siteLocation":{"name":"Lisbon"}}' );

		await setSiteMetadata( { personality: 'playful' } );

		expect( writtenMetadata() ).toEqual( {
			personality: 'playful',
			siteLocation: { name: 'Lisbon' },
		} );
	} );

	it( 'drops the runtime-only mode key', async () => {
		withSiteRecord( '{"mode":"editor","personality":"bold"}' );

		await setSiteMetadata( { personality: 'playful' } );

		expect( writtenMetadata() ).toEqual( { personality: 'playful' } );
	} );

	it( 'keeps agent edits out of the undo stack', async () => {
		withSiteRecord( '{}' );

		await setSiteMetadata( { personality: 'bold' } );

		// Saved, not left pending: nothing about this field is on screen, so a
		// reload would drop it with no cue that a save was outstanding.
		expect( saveSpecifiedEntityEdits ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			[ 'big_sky_site_metadata' ],
			{ throwOnError: true }
		);
		expect( editEntityRecord ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			expect.any( Object ),
			{
				undoIgnore: true,
			}
		);
	} );

	// Merging onto `{}` would silently drop every stored key.
	it( 'refuses to write when the current value cannot be read', async () => {
		withSiteRecord();

		await expect( setSiteMetadata( { personality: 'bold' } ) ).rejects.toThrow( 'unavailable' );
		expect( editEntityRecord ).not.toHaveBeenCalled();
	} );
} );
