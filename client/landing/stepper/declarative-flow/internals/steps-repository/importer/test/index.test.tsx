/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated,
} from 'calypso/state/imports/selectors';
import { withImporterWrapper } from '..';
import type { ImporterCompType } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { Importer as ImporterType, ImportJob } from 'calypso/blocks/importer/types';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( { useSiteQuery: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( { useSiteData: jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-save-hosting-flow-path-step', () => ( {
	useSaveHostingFlowPathStep: jest.fn(),
} ) );
jest.mock( '../hooks/use-atomic-transfer-query-param-update', () => ( {
	useAtomicTransferQueryParamUpdate: jest.fn(),
} ) );
jest.mock( '../hooks/use-initial-query-run', () => ( { useInitialQueryRun: () => false } ) );
jest.mock( '../hooks/use-step-navigator', () => ( { useStepNavigator: () => ( {} ) } ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: () => ( { ID: 1 } ),
} ) );
jest.mock( 'calypso/state/imports/selectors', () => ( {
	getImporterStatusForSiteId: jest.fn(),
	isImporterStatusHydrated: jest.fn(),
} ) );
jest.mock( 'calypso/state/imports/url-analyzer/selectors', () => ( { getUrlData: () => null } ) );

jest.mock( 'calypso/components/data/query-sites', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/lib/logstash', () => ( { logToLogstash: jest.fn() } ) );
jest.mock( 'calypso/blocks/importer/components/not-found', () => () => <div>Not found</div> );
jest.mock( 'calypso/blocks/importer/components/not-authorized', () => () => (
	<div>Not authorized</div>
) );

const Importer = ( () => <div>Importer</div> ) as unknown as ImporterCompType;
const ImporterWrapper = withImporterWrapper( Importer );

const wrapperElement = ( importer: ImporterType = 'wordpress' ) => (
	<ImporterWrapper
		importer={ importer }
		flow="site-setup"
		navigation={ { submit: jest.fn() } }
		stepName="importerWordpress"
	/>
);

const renderWrapper = ( importer?: ImporterType ) => render( wrapperElement( importer ) );

const createJob = ( overrides: Partial< ImportJob > & { file?: { size: number } } = {} ) => ( {
	importerId: 'wordpress-1',
	type: 'importer-type-wordpress',
	site: { ID: 123 },
	importerState: appStates.READY_FOR_UPLOAD,
	importerFileType: 'content',
	...overrides,
} );

const mockSite = ( {
	site,
	isLoading = false,
	isError = false,
}: {
	site?: Partial< SiteDetails > | null;
	isLoading?: boolean;
	isError?: boolean;
} ) => {
	jest.mocked( useSiteData ).mockReturnValue( {
		site: site as SiteDetails,
		siteId: site?.ID ?? 0,
		siteSlug: 'example.wordpress.com',
		siteSlugOrId: 'example.wordpress.com',
	} );
	jest.mocked( useSiteQuery ).mockReturnValue( {
		data: ( site as SiteDetails ) ?? null,
		isLoading,
		isError,
		refetch: jest.fn(),
	} );
};

const isLoaderVisible = ( container: HTMLElement ) =>
	!! container.querySelector( '.step-container-v2--loading' );

describe( 'withImporterWrapper', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getImporterStatusForSiteId ).mockReturnValue( [] );
		jest.mocked( isImporterStatusHydrated ).mockReturnValue( true );
	} );

	describe( 'importer state events', () => {
		beforeEach( () => {
			mockSite( { site: { ID: 123, site_owner: 1 } } );
		} );

		it.each( [
			[ appStates.READY_FOR_UPLOAD, 'calypso_importer_view' ],
			[ appStates.UPLOADING, 'calypso_importer_upload_start' ],
			[ appStates.UPLOAD_SUCCESS, 'calypso_importer_upload_success' ],
			[ appStates.MAP_AUTHORS, 'calypso_importer_map_authors_view' ],
			[ appStates.IMPORTING, 'calypso_importer_import_start' ],
			[ appStates.IMPORT_SUCCESS, 'calypso_importer_import_success' ],
		] )( 'records %s once despite repeated status polls', ( importerState, eventName ) => {
			jest
				.mocked( getImporterStatusForSiteId )
				.mockReturnValue( [ createJob( { importerState } ) ] );
			const { rerender } = renderWrapper();
			jest
				.mocked( getImporterStatusForSiteId )
				.mockReturnValue( [ createJob( { importerState } ) ] );
			rerender( wrapperElement() );
			rerender( wrapperElement() );

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( recordTracksEvent ).toHaveBeenCalledWith( eventName, {
				importer_id: 'importer-type-wordpress',
			} );
		} );

		it( 'records upload failure, retry, upload success and import progression in order', () => {
			const { rerender } = renderWrapper();
			for ( const importerState of [
				appStates.UPLOADING,
				appStates.UPLOAD_FAILURE,
				appStates.UPLOADING,
				appStates.UPLOAD_PROCESSING,
				appStates.UPLOAD_SUCCESS,
				appStates.MAP_AUTHORS,
				appStates.IMPORTING,
				appStates.IMPORT_SUCCESS,
			] ) {
				jest
					.mocked( getImporterStatusForSiteId )
					.mockReturnValue( [ createJob( { importerState } ) ] );
				rerender( wrapperElement() );
			}

			expect( jest.mocked( recordTracksEvent ).mock.calls.map( ( [ name ] ) => name ) ).toEqual( [
				'calypso_importer_upload_start',
				'calypso_importer_upload_fail',
				'calypso_importer_upload_start',
				'calypso_importer_upload_success',
				'calypso_importer_map_authors_view',
				'calypso_importer_import_start',
				'calypso_importer_import_success',
			] );
		} );

		it.each( [ appStates.UPLOAD_FAILURE, appStates.IMPORT_FAILURE ] )(
			'includes structured failure details for %s without the error description',
			( importerState ) => {
				jest.mocked( getImporterStatusForSiteId ).mockReturnValue( [
					createJob( {
						importerState,
						importerFileType: 'playground',
						errorData: { type: 'uploadError', code: 'invalid_file', description: 'file details' },
						file: { size: 150 * 1024 * 1024 },
					} ),
				] );
				renderWrapper();

				expect( recordTracksEvent ).toHaveBeenCalledWith(
					importerState === appStates.UPLOAD_FAILURE
						? 'calypso_importer_upload_fail'
						: 'calypso_importer_import_fail',
					{
						importer_id: 'importer-type-wordpress',
						error_type: 'uploadError',
						error_code: 'invalid_file',
						importer_file_type: 'playground',
						...( importerState === appStates.UPLOAD_FAILURE && { filesize_range: '100—200MB' } ),
					}
				);
			}
		);

		it( 'records a failure again when its error code changes, but not on identical polls', () => {
			const { rerender } = renderWrapper();
			for ( const code of [ undefined, 'invalid_file', 'invalid_file', 'file_too_large' ] ) {
				jest.mocked( getImporterStatusForSiteId ).mockReturnValue( [
					createJob( {
						importerState: appStates.UPLOAD_FAILURE,
						errorData: { type: 'uploadError', code, description: '' },
					} ),
				] );
				rerender( wrapperElement() );
			}

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 3 );
			expect( recordTracksEvent ).toHaveBeenLastCalledWith( 'calypso_importer_upload_fail', {
				importer_id: 'importer-type-wordpress',
				error_type: 'uploadError',
				error_code: 'file_too_large',
				importer_file_type: 'content',
				filesize_range: null,
			} );
		} );

		it( 'tracks a new job even if it starts in the same state as the previous job', () => {
			jest.mocked( getImporterStatusForSiteId ).mockReturnValue( [ createJob() ] );
			const { rerender } = renderWrapper();
			jest
				.mocked( getImporterStatusForSiteId )
				.mockReturnValue( [ createJob( { importerId: 'wordpress-2' } ) ] );
			rerender( wrapperElement() );

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		} );

		it.each< ImporterType >( [ 'wordpress', 'medium', 'squarespace', 'substack', 'wix' ] )(
			'tracks only the selected %s importer',
			( importer ) => {
				jest
					.mocked( getImporterStatusForSiteId )
					.mockReturnValue( [
						createJob( { type: 'another-importer' } ),
						createJob( { type: `importer-type-${ importer }`, importerId: `${ importer }-1` } ),
					] );
				renderWrapper( importer );

				expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
				expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_importer_view', {
					importer_id: `importer-type-${ importer }`,
				} );
			}
		);

		it( 'waits for importer hydration before tracking an existing job', () => {
			jest.mocked( getImporterStatusForSiteId ).mockReturnValue( [ createJob() ] );
			jest.mocked( isImporterStatusHydrated ).mockReturnValue( false );
			const { rerender } = renderWrapper();
			expect( recordTracksEvent ).not.toHaveBeenCalled();

			jest.mocked( isImporterStatusHydrated ).mockReturnValue( true );
			rerender( wrapperElement() );
			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not track a job when the site is loading or the user lacks permission', () => {
			jest.mocked( getImporterStatusForSiteId ).mockReturnValue( [ createJob() ] );
			mockSite( { site: { ID: 123 }, isLoading: true } );
			const { rerender } = renderWrapper();
			mockSite( { site: { ID: 123, site_owner: 2 } } );
			rerender( wrapperElement() );

			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );
	} );

	it( 'shows the loader while the site is loading', () => {
		mockSite( { site: null, isLoading: true } );

		const { container } = renderWrapper();

		expect( isLoaderVisible( container ) ).toBe( true );
		expect( screen.queryByText( 'Importer' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the loader until the importer status is hydrated', () => {
		mockSite( { site: { ID: 123, site_owner: 1 } } );
		jest.mocked( isImporterStatusHydrated ).mockReturnValue( false );

		const { container } = renderWrapper();

		expect( isLoaderVisible( container ) ).toBe( true );
		expect( screen.queryByText( 'Importer' ) ).not.toBeInTheDocument();
	} );

	it( 'shows not found when the site lookup fails, even though the importer status never hydrates', () => {
		mockSite( { site: null, isError: true } );
		jest.mocked( isImporterStatusHydrated ).mockReturnValue( false );

		const { container } = renderWrapper();

		expect( isLoaderVisible( container ) ).toBe( false );
		expect( screen.getByText( 'Not found' ) ).toBeVisible();
	} );

	it( 'renders the importer for the site owner', () => {
		mockSite( { site: { ID: 123, site_owner: 1 } } );

		renderWrapper();

		expect( screen.getByText( 'Importer' ) ).toBeVisible();
	} );

	it( 'renders the importer for a user who can manage options but does not own the site', () => {
		mockSite( {
			site: {
				ID: 123,
				site_owner: 2,
				capabilities: { manage_options: true } as SiteDetails[ 'capabilities' ],
			},
		} );

		renderWrapper();

		expect( screen.getByText( 'Importer' ) ).toBeVisible();
	} );

	it( 'shows not authorized for a user who can neither manage options nor owns the site', () => {
		mockSite( {
			site: {
				ID: 123,
				site_owner: 2,
				capabilities: { manage_options: false } as SiteDetails[ 'capabilities' ],
			},
		} );

		renderWrapper();

		expect( screen.getByText( 'Not authorized' ) ).toBeVisible();
	} );
} );
