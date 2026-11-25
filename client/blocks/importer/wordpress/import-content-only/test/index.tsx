/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { resetImport, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import ImportContentOnly from '..';
import type { SiteDetails } from '@automattic/data-stores';
import type { ImportJob } from 'calypso/blocks/importer/types';

const mockDispatch = vi.fn();

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

vi.mock( 'calypso/state/imports/actions', () => ( {
	startImport: vi.fn( () => ( { type: 'START_IMPORT' } ) ),
	startImporting: vi.fn( () => ( { type: 'START_IMPORTING' } ) ),
	resetImport: vi.fn( () => ( { type: 'RESET_IMPORT' } ) ),
} ) );

vi.mock( 'calypso/state/imports/site-importer/actions', () => ( {
	importSite: vi.fn( () => ( { type: 'IMPORT_SITE' } ) ),
} ) );

vi.mock( '../../../components/complete-screen', () => ( {
	default: ( { onImportAnotherClick }: { onImportAnotherClick?: () => void } ) =>
		onImportAnotherClick ? (
			<button onClick={ onImportAnotherClick }>Start another import</button>
		) : null,
} ) );
vi.mock( '../../../components/error-message', () => ( { default: () => null } ) );
vi.mock( '../../../components/importer-drag', () => ( { default: () => <div>Upload</div> } ) );
vi.mock( '../../../components/migration-plans-grid', () => ( { default: () => null } ) );
vi.mock( '../../../components/progress-screen', () => ( { default: () => null } ) );

const site = { ID: 123, plan: { features: { active: [] } } } as unknown as SiteDetails;

const renderImporter = ( job?: ImportJob ) =>
	render(
		<ImportContentOnly
			job={ job }
			importer="wordpress"
			siteItem={ site }
			siteSlug="example.wordpress.com"
			siteAnalyzedData={ null }
		/>
	);

describe( 'ImportContentOnly', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'creates an import job when there is none', () => {
		renderImporter();

		expect( startImport ).toHaveBeenCalledWith( 123, 'importer-type-wordpress' );
	} );

	it( 'waits for an upload instead of importing a site when the job is ready for upload', () => {
		renderImporter( {
			importerId: 'importer-123',
			importerState: appStates.READY_FOR_UPLOAD,
			type: 'importer-type-wordpress',
			site: { ID: 123 },
		} as ImportJob );

		expect( importSite ).not.toHaveBeenCalled();
	} );

	// Without it, a finished import keeps the importer on the success screen until it expires.
	it( 'resets the finished import when starting another import', async () => {
		renderImporter( {
			importerId: 'importer-123',
			importerState: appStates.IMPORT_SUCCESS,
			type: 'importer-type-wordpress',
			site: { ID: 123 },
		} as ImportJob );

		await userEvent.click( screen.getByRole( 'button', { name: 'Start another import' } ) );

		expect( resetImport ).toHaveBeenCalledWith( 123, 'importer-123' );
	} );

	it.each( [ 'playground', 'jetpack_backup' ] as const )(
		'does not offer another import after a site restore from a %s file',
		( importerFileType ) => {
			renderImporter( {
				importerId: 'importer-123',
				importerState: appStates.IMPORT_SUCCESS,
				importerFileType,
				type: 'importer-type-wordpress',
				site: { ID: 123 },
			} as ImportJob );

			expect( screen.queryByRole( 'button', { name: 'Start another import' } ) ).toBeNull();
		}
	);
} );
