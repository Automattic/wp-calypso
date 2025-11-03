/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { HostingFeatures, LogType } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteLogs from '../index';

const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

jest.mock( '../../../app/auth', () => ( {
	useAuth: () => ( { user: { id: 'test-user' } } ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
	sprintf: ( text: string ) => text,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
	useRegistry: () => ( {} ),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	store: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

jest.mock( '../../../app/router/sites', () => ( {
	siteRoute: {
		useParams: () => ( { siteSlug: 'test-site' } ),
	},
} ) );

jest.mock( '@tanstack/react-router', () => {
	const actual = jest.requireActual( '@tanstack/react-router' );
	const navigate = jest.fn();
	return {
		...actual,
		useRouter: () => ( {
			navigate,
			state: { location: { pathname: '/', search: '', hash: '', href: '/' } },
		} ),
		__mocks: { navigate },
	};
} );

jest.mock( '../../../utils/site-features', () => {
	const hasHostingFeatureMock = jest.fn();
	const hasPlanFeatureMock = jest.fn();
	return {
		hasHostingFeature: ( ...args: unknown[] ) => hasHostingFeatureMock( ...args ),
		hasPlanFeature: ( ...args: unknown[] ) => hasPlanFeatureMock( ...args ),
		__mocks: { hasHostingFeatureMock, hasPlanFeatureMock },
	};
} );

// Child heavy components: stub to avoid additional network
jest.mock( '../dataviews', () => ( props: any ) => (
	<button onClick={ () => props.onAutoRefreshRequest?.( true ) }>Toggle auto</button>
) );
jest.mock( '../../logs-activity/dataviews', () => () => null );

// DateRangePicker: stub with controls
jest.mock( '../../../components/date-range-picker', () => ( {
	DateRangePicker: () => (
		<div>
			{ /* Keep the buttons in the DOM so tests find them, but remove onClick handlers */ }
			<button>Set non-last7 (yesterday)</button>
			<button>Set last7</button>
		</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	__experimentalVStack: ( { children, as = 'div', ...rest }: any ) => {
		const Tag = as as any;
		return <Tag { ...rest }>{ children }</Tag>;
	},
	TabPanel: ( { onSelect }: any ) => (
		<div>
			<button onClick={ () => onSelect( 'php' ) }>PHP errors</button>
			<button onClick={ () => onSelect( 'server' ) }>Web server</button>
			<button onClick={ () => onSelect( 'activity' ) }>Activity</button>
		</div>
	),
} ) );

// Minimal stubs for app components used by the page
jest.mock( '../../../components/card', () => ( {
	Card: ( { children }: any ) => <div>{ children }</div>,
	CardBody: ( { children }: any ) => <div>{ children }</div>,
	CardHeader: ( { children }: any ) => <div>{ children }</div>,
} ) );

jest.mock( '../../../components/page-layout', () => ( {
	__esModule: true,
	default: ( { children, header }: any ) => (
		<div>
			<div>{ header }</div>
			<div>{ children }</div>
		</div>
	),
} ) );

jest.mock( '../../../components/page-header', () => ( {
	PageHeader: ( { actions }: any ) => <div>{ actions }</div>,
} ) );

jest.mock( '../../../components/notice', () => ( {
	__esModule: true,
	default: ( { children }: any ) => <div>{ children }</div>,
} ) );

function nockSiteAndSettings( {
	gmtOffset = 0,
	timezoneString = '',
}: { gmtOffset?: number; timezoneString?: string } = {} ) {
	nock( API_BASE )
		.get( '/rest/v1.1/sites/test-site' )
		.query( true )
		.reply( 200, {
			ID: mockSiteId,
			slug: 'test-site',
			options: { admin_url: 'https://example.com/wp-admin/' },
		} );
	nock( API_BASE )
		.get( `/rest/v1.4/sites/${ mockSiteId }/settings` )
		.reply( 200, { settings: { gmt_offset: gmtOffset, timezone_string: timezoneString } } );
}

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
} );

beforeAll( () => {
	nock.disableNetConnect();
} );
afterAll( () => {
	nock.enableNetConnect();
} );

describe( 'SiteLogs page', () => {
	test( 'navigates on tab select for PHP errors/Web server/Activity', async () => {
		const { __mocks: featureMocks } = jest.requireMock( '../../../utils/site-features' ) as {
			__mocks: { hasHostingFeatureMock: jest.Mock; hasPlanFeatureMock: jest.Mock };
		};
		featureMocks.hasHostingFeatureMock.mockReturnValue( true );
		featureMocks.hasPlanFeatureMock.mockReturnValue( false );
		nockSiteAndSettings();

		render( <SiteLogs logType={ LogType.PHP } /> );

		// Wait for data and TabPanel to render
		await waitFor( () => expect( nock.isDone() ).toBe( true ), { timeout: 5000 } );

		// Click web server and activity tabs
		await userEvent.click( await screen.findByRole( 'button', { name: 'Web server' } ) );
		const { __mocks: routerMocks } = jest.requireMock( '@tanstack/react-router' ) as {
			__mocks: { navigate: jest.Mock };
		};
		expect( routerMocks.navigate ).toHaveBeenCalledWith( { to: '/sites/test-site/logs/server' } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Activity' } ) );
		expect( routerMocks.navigate ).toHaveBeenCalledWith( { to: '/sites/test-site/logs/activity' } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'PHP errors' } ) );
		expect( routerMocks.navigate ).toHaveBeenCalledWith( { to: '/sites/test-site/logs/php' } );
	} );

	test( 'URL from/to params are normalized from ms to seconds', async () => {
		const { __mocks: featureMocks } = jest.requireMock( '../../../utils/site-features' ) as {
			__mocks: { hasHostingFeatureMock: jest.Mock; hasPlanFeatureMock: jest.Mock };
		};
		featureMocks.hasHostingFeatureMock.mockReturnValue( true );
		featureMocks.hasPlanFeatureMock.mockReturnValue( false );
		nockSiteAndSettings();

		const replaceSpy = jest.spyOn( window.history, 'replaceState' );
		const msFrom = 1730000000000; // ms
		const msTo = 1730086400000; // ms
		const originalHref = window.location.href;
		Object.defineProperty( window, 'location', {
			value: { href: `https://example.com?from=${ msFrom }&to=${ msTo }` },
			writable: true,
		} );

		render( <SiteLogs logType={ LogType.PHP } /> );

		await waitFor( () => expect( replaceSpy ).toHaveBeenCalled() );
		const hrefArgs = replaceSpy.mock.calls
			.map( ( call ) => call?.[ 2 ] )
			.filter( ( v ): v is string => typeof v === 'string' );
		expect( hrefArgs.some( ( h ) => h.includes( `from=${ Math.floor( msFrom / 1000 ) }` ) ) ).toBe(
			true
		);
		expect( hrefArgs.some( ( h ) => h.includes( `to=${ Math.floor( msTo / 1000 ) }` ) ) ).toBe(
			true
		);

		// restore
		Object.defineProperty( window, 'location', { value: { href: originalHref } } );
		replaceSpy.mockRestore();
	} );

	test( 'auto-refresh is blocked for non-last-7 (yesterday) range and shows warning notice', async () => {
		const { __mocks: featureMocks } = jest.requireMock( '../../../utils/site-features' ) as {
			__mocks: { hasHostingFeatureMock: jest.Mock; hasPlanFeatureMock: jest.Mock };
		};
		featureMocks.hasHostingFeatureMock.mockImplementation(
			( _site: unknown, feature: unknown ) => feature === HostingFeatures.LOGS
		);
		featureMocks.hasPlanFeatureMock.mockReturnValue( false );
		nockSiteAndSettings();

		// Mock the last-7 check to return false
		const dateRangeUtils = jest.requireActual( '../../../components/date-range-picker/utils' ) as {
			isLast7Days: ( range: any ) => boolean;
		};
		jest.spyOn( dateRangeUtils, 'isLast7Days' ).mockReturnValue( false );

		render( <SiteLogs logType={ LogType.PHP } /> );
		await waitFor( () => expect( nock.isDone() ).toBe( true ), { timeout: 5000 } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Toggle auto' } ) );

		expect(
			screen.getByText( 'Auto-refresh only works with "Last 7 days" preset' )
		).toBeInTheDocument();
	} );

	test( 'auto-refresh is allowed for last-7 range and does not show warning notice', async () => {
		const { __mocks: featureMocks } = jest.requireMock( '../../../utils/site-features' ) as {
			__mocks: { hasHostingFeatureMock: jest.Mock; hasPlanFeatureMock: jest.Mock };
		};
		featureMocks.hasHostingFeatureMock.mockReturnValue( true );
		featureMocks.hasPlanFeatureMock.mockReturnValue( false );
		nockSiteAndSettings();

		// Mock the last-7 check to always allow auto-refresh
		const dateRangeUtils = jest.requireActual( '../../../components/date-range-picker/utils' ) as {
			isLast7Days: ( range: any ) => boolean;
		};
		jest.spyOn( dateRangeUtils, 'isLast7Days' ).mockReturnValue( true );

		render( <SiteLogs logType={ LogType.PHP } /> );
		await waitFor( () => expect( nock.isDone() ).toBe( true ), { timeout: 5000 } );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Toggle auto' } ) );

		expect(
			screen.queryByText( 'Auto-refresh only works with "Last 7 days" preset' )
		).not.toBeInTheDocument();
	} );
} );
