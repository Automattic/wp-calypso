/** @jest-environment jsdom */

import { render } from '@testing-library/react';
import { startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import { importSite } from 'calypso/state/imports/site-importer/actions';
import ImportContentOnly from '..';
import type { SiteDetails } from '@automattic/data-stores';
import type { ImportJob } from 'calypso/blocks/importer/types';

const mockDispatch = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'calypso/state/imports/actions', () => ( {
	startImport: jest.fn( () => ( { type: 'START_IMPORT' } ) ),
	startImporting: jest.fn( () => ( { type: 'START_IMPORTING' } ) ),
	resetImport: jest.fn( () => ( { type: 'RESET_IMPORT' } ) ),
} ) );

jest.mock( 'calypso/state/imports/site-importer/actions', () => ( {
	importSite: jest.fn( () => ( { type: 'IMPORT_SITE' } ) ),
} ) );

jest.mock( '../../../components/complete-screen', () => () => null );
jest.mock( '../../../components/error-message', () => () => null );
jest.mock( '../../../components/importer-drag', () => () => <div>Upload</div> );
jest.mock( '../../../components/migration-plans-grid', () => () => null );
jest.mock( '../../../components/progress-screen', () => () => null );

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
		jest.clearAllMocks();
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
} );
