/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { HostingFeatures } from '@automattic/api-core';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import ScanCard from '../index';
import type { Site, SiteScan, Threat } from '@automattic/api-core';

const mockSiteId = 123;

const mockFetchSiteScan = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchSiteScan: ( ...args: unknown[] ) => mockFetchSiteScan( ...args ),
} ) );

const mockSite: Site = {
	ID: mockSiteId,
	plan: {
		features: {
			active: [ HostingFeatures.SCAN ],
		},
	},
	is_wpcom_atomic: true,
} as Site;

jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: ( text: string ) => text,
	_n: ( singular: string, plural: string, count: number ) => ( count === 1 ? singular : plural ),
	sprintf: ( format: string, ...args: unknown[] ) => {
		let result = format;
		args.forEach( ( arg ) => {
			result = result.replace( /%[sd]/, String( arg ) );
		} );
		return result;
	},
} ) );

jest.mock( '../../../app/locale', () => ( {
	useLocale: () => 'en',
} ) );

afterEach( () => {
	jest.clearAllMocks();
} );

describe( 'ScanCard', () => {
	test( 'shows "No risks found" when there are no threats', async () => {
		mockFetchSiteScan.mockResolvedValue( {
			state: 'idle',
			threats: [],
			has_cloud: true,
			current: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				progress: 100,
			},
			most_recent: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				duration: 30,
				progress: 100,
				error: false,
			},
		} as SiteScan );

		render( <ScanCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( 'No risks found' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows "Auto fixes are available" when threats are fixable', async () => {
		const fixableThreat: Threat = {
			id: 1,
			signature: 'Vulnerable.WP.Core',
			title: 'WordPress outdated',
			description: 'WordPress is outdated',
			first_detected: new Date().toISOString(),
			severity: 5,
			status: 'current',
			fixable: {
				fixer: 'update',
				extras: {
					is_bulk_fixable: true,
				},
			},
		};

		mockFetchSiteScan.mockResolvedValue( {
			state: 'idle',
			threats: [ fixableThreat ],
			has_cloud: true,
			current: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				progress: 100,
			},
			most_recent: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				duration: 30,
				progress: 100,
				error: false,
			},
		} as SiteScan );

		render( <ScanCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( '1 risk found' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Auto fixes are available.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows "Manual review required" when threats are not fixable', async () => {
		const nonFixableThreat: Threat = {
			id: 2,
			signature: 'Vulnerable.WP.Plugin',
			title: 'Vulnerable plugin',
			description: 'Plugin has known vulnerability',
			first_detected: new Date().toISOString(),
			severity: 5,
			status: 'current',
			// No fixable property means it cannot be auto-fixed
		};

		mockFetchSiteScan.mockResolvedValue( {
			state: 'idle',
			threats: [ nonFixableThreat ],
			has_cloud: true,
			current: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				progress: 100,
			},
			most_recent: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				duration: 30,
				progress: 100,
				error: false,
			},
		} as SiteScan );

		render( <ScanCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( '1 risk found' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Manual review required.' ) ).toBeInTheDocument();
		} );
	} );

	test( 'shows "Auto fixes are available" when at least one threat is fixable among multiple threats', async () => {
		const fixableThreat: Threat = {
			id: 1,
			signature: 'Vulnerable.WP.Core',
			title: 'WordPress outdated',
			description: 'WordPress is outdated',
			first_detected: new Date().toISOString(),
			severity: 5,
			status: 'current',
			fixable: {
				fixer: 'update',
				extras: {
					is_bulk_fixable: true,
				},
			},
		};

		const nonFixableThreat: Threat = {
			id: 2,
			signature: 'Vulnerable.WP.Plugin',
			title: 'Vulnerable plugin',
			description: 'Plugin has known vulnerability',
			first_detected: new Date().toISOString(),
			severity: 5,
			status: 'current',
			// No fixable property
		};

		mockFetchSiteScan.mockResolvedValue( {
			state: 'idle',
			threats: [ fixableThreat, nonFixableThreat ],
			has_cloud: true,
			current: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				progress: 100,
			},
			most_recent: {
				is_initial: false,
				timestamp: new Date().toISOString(),
				duration: 30,
				progress: 100,
				error: false,
			},
		} as SiteScan );

		render( <ScanCard site={ mockSite } /> );

		await waitFor( () => {
			expect( screen.getByText( '2 risks found' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Auto fixes are available.' ) ).toBeInTheDocument();
		} );
	} );
} );
