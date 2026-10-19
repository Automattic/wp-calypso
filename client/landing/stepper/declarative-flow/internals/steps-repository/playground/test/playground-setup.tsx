/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import { appStates } from 'calypso/state/imports/constants';
import { mockStepProps, renderStep } from '../../test/helpers';
import PlaygroundSetupStep from '../components/playground-setup';
import {
	ImportFailureError,
	ImportTimeoutError,
	importPlaygroundSite,
} from '../lib/import-playground';
import type { PlaygroundImportProgress } from '../lib/import-playground';
import type { ImportJob } from 'calypso/blocks/importer/types';

jest.mock( '../lib/import-playground', () => ( {
	...jest.requireActual( '../lib/import-playground' ),
	importPlaygroundSite: jest.fn(),
	removeSandboxPlugins: jest.fn(),
} ) );

jest.mock( '../components/playground-iframe', () => ( {
	PlaygroundIframe: ( { setPlaygroundClient }: { setPlaygroundClient: ( c: object ) => void } ) => {
		// Like the real iframe, hand over the client once after it boots.
		jest.requireActual( 'react' ).useEffect( () => {
			setPlaygroundClient( {} );
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );
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
		( _slug, _siteId, onProgress: ( p: PlaygroundImportProgress ) => void ) => {
			onProgress( progress );
			return new Promise( () => {} );
		}
	);

	return renderSetupStep();
}

async function renderSetupStep() {
	const props = mockStepProps();
	await act( async () => {
		renderStep( <PlaygroundSetupStep { ...props } />, {
			initialEntry:
				'/setup/onboarding/importerPlayground?playground=abc&siteSlug=example.wordpress.com',
		} );
	} );
	return props;
}

describe( 'PlaygroundSetupStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
	} );

	it( 'shows that the Playground site is loading before packing starts', async () => {
		importPlaygroundSiteMock.mockReturnValue( new Promise( () => {} ) );
		await renderSetupStep();

		expect( screen.getByText( 'Loading your Playground site...' ) ).toBeVisible();
	} );

	it( 'shows that the import is starting once the upload is done', async () => {
		await renderDuring( { phase: 'starting' } );

		expect( screen.getByText( 'Starting the import...' ) ).toBeVisible();
	} );

	it( 'shows that the site is being packed up', async () => {
		await renderDuring( { phase: 'packing' } );

		expect( screen.getByText( 'Packing up your site...' ) ).toBeVisible();
	} );

	it( 'calls a WooCommerce launch a store', async () => {
		sessionStorage.setItem( 'entrepreneur_playground_woo_intent', '1' );
		await renderDuring( { phase: 'packing' } );

		expect( screen.getByText( 'Packing up your store...' ) ).toBeVisible();
	} );

	it( 'shows the real upload percentage', async () => {
		await renderDuring( { phase: 'uploading', percent: 40 } );

		expect( screen.getByText( 'Uploading to WordPress.com...' ) ).toBeVisible();
		expect( screen.getByRole( 'progressbar' ) ).toHaveAttribute( 'aria-valuenow', '40' );
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

	it( 'keeps every phase on the same keep-this-window-open screen', async () => {
		await renderDuring( { phase: 'uploading', percent: 40 } );

		expect(
			screen.getByText(
				'This usually takes a few minutes. Keep this window open until your site is ready.'
			)
		).toBeVisible();
	} );

	it( 'finishes a site launch on this screen', async () => {
		importPlaygroundSiteMock.mockResolvedValue( 'import-id' );
		const props = await renderSetupStep();

		expect( screen.getByText( 'Your site is ready' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Go to dashboard' } ) ).toHaveAttribute(
			'href',
			'/home/example.wordpress.com'
		);
		expect( screen.getByRole( 'link', { name: 'View site' } ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com'
		);
		expect( props.navigation.submit ).not.toHaveBeenCalled();
	} );

	it( 'hands a WooCommerce publish launch back to its flow when the import finishes', async () => {
		sessionStorage.setItem( 'entrepreneur_from_playground_publish', '1' );
		importPlaygroundSiteMock.mockResolvedValue( 'import-id' );
		const props = await renderSetupStep();

		expect( props.navigation.submit ).toHaveBeenCalledWith( {
			siteSlug: 'example.wordpress.com',
			siteId: 123,
		} );
	} );

	it( 'shows an error with a retry when the import fails', async () => {
		importPlaygroundSiteMock.mockRejectedValueOnce( new ImportFailureError() );
		importPlaygroundSiteMock.mockReturnValueOnce( new Promise( () => {} ) );
		await renderSetupStep();

		expect( screen.getByText( 'Your site could not be imported' ) ).toBeVisible();

		await act( async () => {
			screen.getByRole( 'button', { name: 'Try again' } ).click();
		} );

		expect( importPlaygroundSiteMock ).toHaveBeenCalledTimes( 2 );
		expect( screen.queryByText( 'Your site could not be imported' ) ).not.toBeInTheDocument();
	} );

	it( 'says a timed-out import may still finish', async () => {
		importPlaygroundSiteMock.mockRejectedValue( new ImportTimeoutError() );
		await renderSetupStep();

		expect( screen.getByText( /may still finish/ ) ).toBeVisible();
	} );
} );
