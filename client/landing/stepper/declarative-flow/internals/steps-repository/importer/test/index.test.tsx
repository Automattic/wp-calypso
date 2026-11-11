/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { isImporterStatusHydrated } from 'calypso/state/imports/selectors';
import { withImporterWrapper } from '..';
import type { ImporterCompType } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

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
	getImporterStatusForSiteId: () => [],
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

const renderWrapper = () =>
	render(
		<ImporterWrapper
			importer="wordpress"
			flow="site-setup"
			navigation={ { submit: jest.fn() } }
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
		jest.mocked( isImporterStatusHydrated ).mockReturnValue( true );
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
