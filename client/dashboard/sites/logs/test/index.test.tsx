/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { LogType } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteLogs from '../index';
import type { SiteLogsDataViewsProps } from '../dataviews';

const API_BASE = 'https://public-api.wordpress.com';
const mockSiteId = 123;

jest.mock( '../../../app/auth', () => ( {
	useAuth: () => ( { user: { id: 'test-user' } } ),
} ) );

jest.mock( '../../../components/time-mismatch-notice', () => ( {
	__esModule: true,
	default: () => null,
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
jest.mock( '../dataviews', () => ( props: SiteLogsDataViewsProps ) => (
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

type VStackProps = {
	children: React.ReactNode;
	as?: keyof JSX.IntrinsicElements;
};

type TabPanelProps = {
	onSelect: ( tab: string ) => void;
};

jest.mock( '@wordpress/components', () => ( {
	__experimentalVStack: ( { children, as = 'div', ...rest }: VStackProps ) => {
		const Tag = as;
		return <Tag { ...rest }>{ children }</Tag>;
	},
	TabPanel: ( { onSelect }: TabPanelProps ) => (
		<div>
			<button onClick={ () => onSelect( 'php' ) }>PHP errors</button>
			<button onClick={ () => onSelect( 'server' ) }>Web server</button>
			<button onClick={ () => onSelect( 'activity' ) }>Activity</button>
		</div>
	),
} ) );

type ChildrenProps = { children?: React.ReactNode };

// Minimal stubs for app components used by the page
jest.mock( '../../../components/card', () => ( {
	Card: ( { children }: ChildrenProps ) => <div>{ children }</div>,
	CardBody: ( { children }: ChildrenProps ) => <div>{ children }</div>,
	CardHeader: ( { children }: ChildrenProps ) => <div>{ children }</div>,
} ) );

interface PageLayoutMockProps {
	children?: React.ReactNode;
	header?: React.ReactNode;
	notices?: React.ReactNode;
}

interface PageHeaderMockProps {
	actions?: React.ReactNode;
}

jest.mock( '../../../components/page-layout', () => ( {
	__esModule: true,
	default: ( { children, header, notices }: PageLayoutMockProps ) => (
		<div>
			<div>{ header }</div>
			<div>{ notices }</div>
			<div>{ children }</div>
		</div>
	),
} ) );

jest.mock( '../../../components/page-header', () => ( {
	PageHeader: ( { actions }: PageHeaderMockProps ) => <div>{ actions }</div>,
} ) );

jest.mock( '../../../components/notice', () => ( {
	__esModule: true,
	default: ( { children }: ChildrenProps ) => <div>{ children }</div>,
} ) );

const { __mocks: featureMocks } = jest.requireMock( '../../../utils/site-features' ) as {
	__mocks: { hasHostingFeatureMock: jest.Mock; hasPlanFeatureMock: jest.Mock };
};

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

beforeEach( () => {
	featureMocks.hasHostingFeatureMock.mockReturnValue( true );
	nockSiteAndSettings();
} );

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
	test.each( Object.entries( LogType ) )(
		'on selecting tab %s, navigates to /%s',
		async ( logType, logTypeName ) => {
			// Different initial log type that the one under test
			const initialLogType = logTypeName !== LogType.PHP ? LogType.PHP : LogType.SERVER;
			render( <SiteLogs logType={ initialLogType } /> );

			// Click another tab
			await userEvent.click(
				await screen.findByRole( 'button', { name: new RegExp( logTypeName, 'i' ) } )
			);
			const { __mocks: routerMocks } = jest.requireMock( '@tanstack/react-router' ) as {
				__mocks: { navigate: jest.Mock };
			};
			expect( routerMocks.navigate ).toHaveBeenCalledWith( {
				to: `/sites/test-site/logs/${ logTypeName }`,
			} );
		}
	);

	test( 'URL from/to params are normalized from ms to seconds', async () => {
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
		// Mock the last-7 check to return false
		const dateRangeUtils = jest.requireActual( '../../../components/date-range-picker/utils' ) as {
			isLast7Days: (
				range: { start: Date; end: Date },
				timezoneString?: string,
				gmtOffset?: number
			) => boolean;
		};
		jest.spyOn( dateRangeUtils, 'isLast7Days' ).mockReturnValue( false );

		render( <SiteLogs logType={ LogType.PHP } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Toggle auto' } ) );

		expect(
			await screen.findByText(
				'Auto-refresh only works with "Last 7 days" preset',
				{},
				{ timeout: 5000 }
			)
		).toBeVisible();
	} );

	test( 'auto-refresh is allowed for last-7 range and does not show warning notice', async () => {
		// Mock the last-7 check to always allow auto-refresh
		const dateRangeUtils = jest.requireActual( '../../../components/date-range-picker/utils' ) as {
			isLast7Days: (
				range: { start: Date; end: Date },
				timezoneString?: string,
				gmtOffset?: number
			) => boolean;
		};
		jest.spyOn( dateRangeUtils, 'isLast7Days' ).mockReturnValue( true );

		render( <SiteLogs logType={ LogType.PHP } /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Toggle auto' } ) );

		expect(
			screen.queryByText( 'Auto-refresh only works with "Last 7 days" preset' )
		).not.toBeInTheDocument();
	} );
} );
