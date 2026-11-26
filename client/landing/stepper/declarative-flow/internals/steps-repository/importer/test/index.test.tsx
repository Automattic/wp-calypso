/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { isImporterStatusHydrated } from 'calypso/state/imports/selectors';
import { withImporterWrapper } from '..';
import type { ImporterCompType } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

vi.mock( 'calypso/landing/stepper/hooks/use-site', () => ( { useSiteQuery: vi.fn() } ) );
vi.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( { useSiteData: vi.fn() } ) );
vi.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );
vi.mock( 'calypso/landing/stepper/hooks/use-save-hosting-flow-path-step', () => ( {
	useSaveHostingFlowPathStep: vi.fn(),
} ) );
vi.mock( '../hooks/use-atomic-transfer-query-param-update', () => ( {
	useAtomicTransferQueryParamUpdate: vi.fn(),
} ) );
vi.mock( '../hooks/use-initial-query-run', () => ( { useInitialQueryRun: () => false } ) );
vi.mock( '../hooks/use-step-navigator', () => ( { useStepNavigator: () => ( {} ) } ) );

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => vi.fn(),
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
vi.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUser: () => ( { ID: 1 } ),
} ) );
vi.mock( 'calypso/state/imports/selectors', () => ( {
	getImporterStatusForSiteId: () => [],
	isImporterStatusHydrated: vi.fn(),
} ) );
vi.mock( 'calypso/state/imports/url-analyzer/selectors', () => ( { getUrlData: () => null } ) );

vi.mock( 'calypso/components/data/query-sites', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );
vi.mock( 'calypso/lib/logstash', () => ( { logToLogstash: vi.fn() } ) );
vi.mock( 'calypso/blocks/importer/components/not-found', () => ( {
	default: () => <div>Not found</div>,
} ) );
vi.mock( 'calypso/blocks/importer/components/not-authorized', () => ( {
	default: () => <div>Not authorized</div>,
} ) );

const Importer = ( () => <div>Importer</div> ) as unknown as ImporterCompType;
const ImporterWrapper = withImporterWrapper( Importer );

const renderWrapper = () =>
	render(
		<ImporterWrapper
			importer="wordpress"
			flow="site-setup"
			navigation={ { submit: vi.fn() } }
			stepName="importerWordpress"
		/>
	);

const mockSite = ( {
	site,
	isLoading = false,
	isError = false,
}: {
	site?: Partial< SiteDetails > | null;
	isLoading?: boolean;
	isError?: boolean;
} ) => {
	vi.mocked( useSiteData ).mockReturnValue( {
		site: site as SiteDetails,
		siteId: site?.ID ?? 0,
		siteSlug: 'example.wordpress.com',
		siteSlugOrId: 'example.wordpress.com',
	} );
	vi.mocked( useSiteQuery ).mockReturnValue( {
		data: ( site as SiteDetails ) ?? null,
		isLoading,
		isError,
		refetch: vi.fn(),
	} );
};

const isLoaderVisible = ( container: HTMLElement ) =>
	!! container.querySelector( '.step-container-v2--loading' );

describe( 'withImporterWrapper', () => {
	beforeEach( () => {
		vi.mocked( isImporterStatusHydrated ).mockReturnValue( true );
	} );

	it( 'shows the loader while the site is loading', () => {
		mockSite( { site: null, isLoading: true } );

		const { container } = renderWrapper();

		expect( isLoaderVisible( container ) ).toBe( true );
		expect( screen.queryByText( 'Importer' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the loader until the importer status is hydrated', () => {
		mockSite( { site: { ID: 123, site_owner: 1 } } );
		vi.mocked( isImporterStatusHydrated ).mockReturnValue( false );

		const { container } = renderWrapper();

		expect( isLoaderVisible( container ) ).toBe( true );
		expect( screen.queryByText( 'Importer' ) ).not.toBeInTheDocument();
	} );

	it( 'shows not found when the site lookup fails, even though the importer status never hydrates', () => {
		mockSite( { site: null, isError: true } );
		vi.mocked( isImporterStatusHydrated ).mockReturnValue( false );

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
