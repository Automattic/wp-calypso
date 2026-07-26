/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSiteResolution } from 'calypso/landing/stepper/hooks/use-site-resolution';
import { logToLogstash } from 'calypso/lib/logstash';
import { withImporterWrapper } from '../index';
import type { ImporterCompType } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

const mockDispatch = jest.fn();
const mockStepNavigator = {
	goToImportCapturePage: jest.fn(),
};

let mockState = {
	currentUser: { ID: 7 },
	importerStatusHydrated: true,
	siteRequesting: false,
	canImport: true,
};

jest.mock( '@automattic/calypso-config', () => jest.fn( () => 'test' ) );

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		CenteredColumnLayout: ( { children }: React.PropsWithChildren ) => <div>{ children }</div>,
		TopBar: () => null,
		BackButton: () => null,
		SkipButton: ( { children }: React.PropsWithChildren ) => <button>{ children }</button>,
		Heading: () => null,
	},
	StepContainer: () => null,
} ) );

jest.mock( '@wordpress/components', () => ( {
	ProgressBar: () => <div role="progressbar" />,
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( {
		__: ( text: string ) => text,
	} ),
} ) );

jest.mock( 'calypso/blocks/importer/components/importer-drag/config', () => ( {
	getImportDragConfig: () => ( {
		title: 'Import',
		description: 'Import content',
	} ),
} ) );

jest.mock( 'calypso/blocks/importer/components/not-authorized', () => () => (
	<div data-testid="not-authorized" />
) );

jest.mock( 'calypso/blocks/importer/components/not-found', () => () => (
	<div data-testid="not-found" />
) );

jest.mock( 'calypso/blocks/importer/util', () => ( {
	getImporterTypeForEngine: ( importer: string ) => importer,
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( 'calypso/components/data/query-sites', () => ( { siteId }: { siteId: number } ) => (
	<div data-testid="query-site" data-site-id={ siteId } />
) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-save-hosting-flow-path-step', () => ( {
	useSaveHostingFlowPathStep: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-resolution', () => ( {
	useSiteResolution: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/interval', () => ( {
	EVERY_FIVE_SECONDS: 5000,
	Interval: () => null,
} ) );

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: ( state: typeof mockState ) => state.currentUser,
} ) );

jest.mock( 'calypso/state/imports/actions', () => ( {
	fetchImporterState: jest.fn( () => ( { type: 'FETCH_IMPORTER_STATE' } ) ),
	resetImport: jest.fn( () => ( { type: 'RESET_IMPORT' } ) ),
	resetImportReceived: jest.fn( () => ( { type: 'RESET_IMPORT_RECEIVED' } ) ),
} ) );

jest.mock( 'calypso/state/imports/constants', () => ( {
	appStates: {
		IMPORTING: 'importing',
		MAP_AUTHORS: 'map-authors',
		READY_FOR_UPLOAD: 'ready-for-upload',
		UPLOAD_PROCESSING: 'upload-processing',
		UPLOAD_SUCCESS: 'upload-success',
		UPLOADING: 'uploading',
		UPLOAD_FAILURE: 'upload-failure',
		IMPORT_SUCCESS: 'import-success',
	},
} ) );

jest.mock( 'calypso/state/imports/selectors', () => ( {
	getImporterStatusForSiteId: () => [],
	isImporterStatusHydrated: ( state: typeof mockState ) => state.importerStatusHydrated,
} ) );

jest.mock( 'calypso/state/imports/url-analyzer/actions', () => ( {
	analyzeUrl: jest.fn( () => ( { type: 'ANALYZE_URL' } ) ),
} ) );

jest.mock( 'calypso/state/imports/url-analyzer/selectors', () => ( {
	getUrlData: () => null,
} ) );

jest.mock( 'calypso/state/selectors/can-current-user', () => ( {
	canCurrentUser: ( state: typeof mockState ) => state.canImport,
} ) );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isRequestingSite: ( state: typeof mockState ) => state.siteRequesting,
} ) );

jest.mock( '../hooks/use-atomic-transfer-query-param-update', () => ( {
	useAtomicTransferQueryParamUpdate: jest.fn(),
} ) );

jest.mock( '../hooks/use-initial-query-run', () => ( {
	useInitialQueryRun: () => false,
} ) );

jest.mock( '../hooks/use-step-navigator', () => ( {
	useStepNavigator: () => mockStepNavigator,
} ) );

const site = {
	ID: 123,
	URL: 'https://example.wordpress.com',
	site_owner: 7,
} as SiteDetails;

const Importer = () => <div data-testid="importer" />;
const WrappedImporter = withImporterWrapper( Importer as ImporterCompType );

const props = {
	importer: 'wordpress' as const,
	navigation: {
		submit: jest.fn(),
		goBack: jest.fn(),
	},
	flow: 'site-migration',
	stepName: 'importerWordpress',
};

function setSiteData( overrides: Partial< ReturnType< typeof useSiteData > > = {} ) {
	( useSiteData as jest.Mock ).mockReturnValue( {
		site,
		siteId: site.ID,
		siteSlug: 'example.wordpress.com',
		siteSlugOrId: 'example.wordpress.com',
		...overrides,
	} );
}

describe( 'withImporterWrapper site loading', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockState = {
			currentUser: { ID: 7 },
			importerStatusHydrated: true,
			siteRequesting: false,
			canImport: true,
		};
		setSiteData();
		( useSiteResolution as jest.Mock ).mockReturnValue( true );
	} );

	it( 'waits for the current-site resolution before showing a missing-site state', () => {
		setSiteData( {
			site: null,
		} );
		( useSiteResolution as jest.Mock ).mockReturnValue( false );

		render( <WrappedImporter { ...props } /> );

		expect( screen.getByRole( 'progressbar' ) ).toBeVisible();
		expect( screen.queryByTestId( 'not-found' ) ).not.toBeInTheDocument();
		expect( logToLogstash ).not.toHaveBeenCalled();
	} );

	it( 'waits for importer status hydration', () => {
		mockState.importerStatusHydrated = false;

		render( <WrappedImporter { ...props } /> );

		expect( screen.getByRole( 'progressbar' ) ).toBeVisible();
	} );

	it( 'waits for an active Redux request for the current site', () => {
		mockState.siteRequesting = true;

		render( <WrappedImporter { ...props } /> );

		expect( screen.getByRole( 'progressbar' ) ).toBeVisible();
	} );

	it( 'renders the importer after the current site resolves', () => {
		render( <WrappedImporter { ...props } /> );

		expect( screen.getByTestId( 'importer' ) ).toBeVisible();
		expect( screen.getByTestId( 'query-site' ) ).toHaveAttribute( 'data-site-id', '123' );
		expect( screen.queryByRole( 'progressbar' ) ).not.toBeInTheDocument();
	} );

	it( 'shows not found only after a missing-site resolution finishes', () => {
		setSiteData( {
			site: null,
		} );

		render( <WrappedImporter { ...props } /> );

		expect( screen.getByTestId( 'not-found' ) ).toBeVisible();
		expect( logToLogstash ).toHaveBeenCalledWith(
			expect.objectContaining( {
				error: 'Importer missing site info',
			} )
		);
	} );

	it( 'shows the unauthorized state for a resolved site without permission', () => {
		mockState.currentUser = { ID: 8 };
		mockState.canImport = false;

		render( <WrappedImporter { ...props } /> );

		expect( screen.getByTestId( 'not-authorized' ) ).toBeVisible();
		expect( screen.queryByTestId( 'importer' ) ).not.toBeInTheDocument();
	} );
} );
