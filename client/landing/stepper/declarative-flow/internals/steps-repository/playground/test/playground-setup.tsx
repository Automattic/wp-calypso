/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import { appStates } from 'calypso/state/imports/constants';
import { mockStepProps, renderStep } from '../../test/helpers';
import PlaygroundSetupStep from '../components/playground-setup';
import { importPlaygroundSite } from '../lib/import-playground';
import type { PlaygroundImportProgress } from '../lib/import-playground';
import type { ImportJob } from 'calypso/blocks/importer/types';

jest.mock( '../lib/import-playground', () => ( {
	...jest.requireActual( '../lib/import-playground' ),
	importPlaygroundSite: jest.fn(),
	removeSandboxPlugins: jest.fn(),
} ) );

jest.mock( '../components/playground-iframe', () => ( {
	PlaygroundIframe: ( { setPlaygroundClient }: { setPlaygroundClient: ( c: object ) => void } ) => {
		jest.requireActual( 'react' ).useEffect( () => {
			setPlaygroundClient( {} );
		}, [ setPlaygroundClient ] );
		return null;
	},
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteId: 123, siteSlug: 'example.wordpress.com' } ),
} ) );

const importPlaygroundSiteMock = importPlaygroundSite as jest.Mock;

/**
 * Renders the step while the import reports the given phase and never finishes.
 */
async function renderDuring( progress: PlaygroundImportProgress ) {
	importPlaygroundSiteMock.mockImplementation(
		( _slug, _siteId, { onProgress }: { onProgress: ( p: PlaygroundImportProgress ) => void } ) => {
			onProgress( progress );
			return new Promise( () => {} );
		}
	);

	await act( async () => {
		renderStep( <PlaygroundSetupStep { ...mockStepProps() } />, {
			initialEntry:
				'/setup/onboarding/importerPlayground?playground=abc&siteSlug=example.wordpress.com',
		} );
	} );
}

describe( 'PlaygroundSetupStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
	} );

	it( 'shows that the site is being prepared before packing starts', async () => {
		importPlaygroundSiteMock.mockReturnValue( new Promise( () => {} ) );
		await act( async () => {
			renderStep( <PlaygroundSetupStep { ...mockStepProps() } />, {
				initialEntry:
					'/setup/onboarding/importerPlayground?playground=abc&siteSlug=example.wordpress.com',
			} );
		} );

		expect( screen.getByRole( 'heading', { name: 'Preparing your site' } ) ).toBeVisible();
	} );

	it( 'shows that the import is starting once the upload is done', async () => {
		await renderDuring( { phase: 'starting' } );

		expect( screen.getByRole( 'heading', { name: 'Starting the import' } ) ).toBeVisible();
	} );

	it( 'shows that the site is being packed up', async () => {
		await renderDuring( { phase: 'packing' } );

		expect( screen.getByRole( 'heading', { name: 'Packing up your site' } ) ).toBeVisible();
	} );

	it( 'calls a WooCommerce launch a store', async () => {
		sessionStorage.setItem( 'entrepreneur_playground_woo_intent', '1' );
		await renderDuring( { phase: 'packing' } );

		expect( screen.getByRole( 'heading', { name: 'Packing up your store' } ) ).toBeVisible();
	} );

	it( 'shows the real upload percentage', async () => {
		await renderDuring( { phase: 'uploading', percent: 40 } );

		expect( screen.getByRole( 'heading', { name: 'Uploading to WordPress.com' } ) ).toBeVisible();
		expect( screen.getByRole( 'progressbar' ) ).toHaveProperty( 'value', 40 );
	} );

	it( 'shows the current import step reported by the server', async () => {
		await renderDuring( {
			phase: 'importing',
			job: {
				importerId: 'import-id',
				importerState: appStates.IMPORTING,
				importerFileType: 'playground',
				type: 'importer-type-wordpress',
				site: { ID: 123 },
				customData: { current_step: 'process_files' },
				progress: { steps: { completed: 4, total: 9 } },
			} as ImportJob,
		} );

		expect( screen.getByText( 'Moving your files...' ) ).toBeVisible();
		expect(
			screen.getByText(
				'This usually takes a few minutes. Keep this window open until your site is ready.'
			)
		).toBeVisible();
		expect( screen.queryByText( /Feel free to close this window/ ) ).not.toBeInTheDocument();
	} );
} );
