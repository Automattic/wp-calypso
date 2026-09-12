/**
 * @jest-environment jsdom
 */
import { dispatch, select } from '@wordpress/data';
import { isEditorPage } from '../../../utils/is-editor-page';
import { saveChanges, saveChangesCallback } from '../callback';
import type { SaveChangesIO } from '../callback';

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );
jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '../../../utils/is-editor-page', () => ( {
	isEditorPage: jest.fn( () => true ),
} ) );

const editEntityRecord = jest.fn();
const saveEditedEntityRecord = jest.fn( () => Promise.resolve( {} ) );
const saveSpecifiedSiteEdits = jest.fn( () => Promise.resolve( {} ) );
const markLastChangeAsPersistent = jest.fn();

function makeIO( overrides: Partial< SaveChangesIO > = {} ): SaveChangesIO {
	return {
		getDirtyEntityRecords: () => [ { kind: 'postType', name: 'page', key: 12 } ],
		getSiteEdits: () => ( {} ),
		isSavingEntityRecord: () => false,
		editEntityRecord,
		saveEditedEntityRecord,
		saveSpecifiedSiteEdits,
		markLastChangeAsPersistent,
		...overrides,
	};
}

beforeEach( () => {
	jest.clearAllMocks();
	jest.mocked( isEditorPage ).mockReturnValue( true );
	saveEditedEntityRecord.mockResolvedValue( {} );
	saveSpecifiedSiteEdits.mockResolvedValue( {} );
} );

describe( 'saveChanges', () => {
	it( 'uses Gutenberg core-data saves so normal revision and saving state hooks run', async () => {
		const result = await saveChanges(
			makeIO( {
				getDirtyEntityRecords: () => [
					{ kind: 'postType', name: 'page', key: 12 },
					{ kind: 'postType', name: 'wp_template_part', key: 'theme//header' },
				],
			} )
		);

		expect( saveEditedEntityRecord ).toHaveBeenNthCalledWith( 1, 'postType', 'page', 12, {
			throwOnError: true,
		} );
		expect( saveEditedEntityRecord ).toHaveBeenNthCalledWith(
			2,
			'postType',
			'wp_template_part',
			'theme//header',
			{ throwOnError: true }
		);
		expect( markLastChangeAsPersistent ).toHaveBeenCalledTimes( 1 );
		expect( result ).toMatchObject( {
			result: { success: true, details: { savedEntityCount: 2 } },
			returnToAgent: true,
		} );
	} );

	it( 'matches the Site Editor save path for navigation records', async () => {
		await saveChanges(
			makeIO( {
				getDirtyEntityRecords: () => [ { kind: 'postType', name: 'wp_navigation', key: 44 } ],
			} )
		);

		expect( editEntityRecord ).toHaveBeenCalledWith( 'postType', 'wp_navigation', 44, {
			status: 'publish',
		} );
		expect( editEntityRecord.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			saveEditedEntityRecord.mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'saves site settings with the Site Editor specified-edits action', async () => {
		await saveChanges(
			makeIO( {
				getDirtyEntityRecords: () => [ { kind: 'root', name: 'site' } ],
				getSiteEdits: () => ( { site_logo: 99, title: 'New title' } ),
			} )
		);

		expect( saveSpecifiedSiteEdits ).toHaveBeenCalledWith(
			'root',
			'site',
			undefined,
			[ 'site_logo', 'title' ],
			{ throwOnError: true }
		);
		expect( saveEditedEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'is an idempotent success when nothing is staged', async () => {
		const result = await saveChanges( makeIO( { getDirtyEntityRecords: () => [] } ) );

		expect( saveEditedEntityRecord ).not.toHaveBeenCalled();
		expect( markLastChangeAsPersistent ).not.toHaveBeenCalled();
		expect( result.result ).toMatchObject( {
			success: true,
			message: 'There are no unsaved changes.',
			details: { savedEntityCount: 0 },
		} );
	} );

	it( 'does not start a second editor save while one is in progress', async () => {
		const result = await saveChanges( makeIO( { isSavingEntityRecord: () => true } ) );

		expect( saveEditedEntityRecord ).not.toHaveBeenCalled();
		expect( result.result.success ).toBe( false );
		expect( result.result.error ).toContain( 'already saving' );
	} );

	it( 'reports partial failures without hiding successful saves', async () => {
		saveEditedEntityRecord
			.mockResolvedValueOnce( {} )
			.mockRejectedValueOnce( new Error( 'Template save failed.' ) );

		const result = await saveChanges(
			makeIO( {
				getDirtyEntityRecords: () => [
					{ kind: 'postType', name: 'page', key: 12 },
					{ kind: 'postType', name: 'wp_template', key: 'theme//home' },
				],
			} )
		);

		expect( result ).toMatchObject( {
			result: {
				success: false,
				error: 'Template save failed.',
				message:
					'One or more changes could not be saved. The unsaved changes remain staged in the editor.',
				details: { savedEntityCount: 1, failedEntityCount: 1 },
			},
		} );
	} );
} );

describe( 'saveChangesCallback', () => {
	it( 'refuses outside an editor', async () => {
		jest.mocked( isEditorPage ).mockReturnValue( false );

		const result = await saveChangesCallback();

		expect( result.result.success ).toBe( false );
		expect( select ).not.toHaveBeenCalled();
	} );

	it( 'connects the ability to the registered editor stores', async () => {
		jest.mocked( select ).mockReturnValue( {
			__experimentalGetDirtyEntityRecords: () => [ { kind: 'postType', name: 'page', key: 12 } ],
			getEntityRecordEdits: () => ( {} ),
			isSavingEntityRecord: () => false,
		} as never );
		jest.mocked( dispatch ).mockImplementation( ( store ) => {
			if ( store === 'core/block-editor' ) {
				return { __unstableMarkLastChangeAsPersistent: markLastChangeAsPersistent } as never;
			}
			return {
				editEntityRecord,
				saveEditedEntityRecord,
				__experimentalSaveSpecifiedEntityEdits: saveSpecifiedSiteEdits,
			} as never;
		} );

		const result = await saveChangesCallback();

		expect( saveEditedEntityRecord ).toHaveBeenCalledWith( 'postType', 'page', 12, {
			throwOnError: true,
		} );
		expect( markLastChangeAsPersistent ).toHaveBeenCalled();
		expect( result.result.success ).toBe( true );
	} );
} );
