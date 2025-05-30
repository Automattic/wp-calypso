/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import domainController from '../controller';
import { DOMAIN_OVERVIEW } from '../domain-overview-pane/constants';

jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/sites/selectors' );

jest.mock( 'calypso/components/data/domain-management', () => {
	const DomainManagementData = ( { children } ) => <div>{ children }</div>;
	return DomainManagementData;
} );

jest.mock( 'calypso/components/file-picker/component-file-picker', () => () => (
	<div>File Picker</div>
) );

describe( 'domainManagementV2', () => {
	const mockNext = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'sets up page context with decoded domain name', () => {
		const pageContext = {
			params: {
				domain: 'example.com',
			},
			primary: null,
		};

		domainController.domainManagementV2( pageContext, mockNext );

		const { container } = render( pageContext.primary as React.ReactElement );
		expect( container ).toBeInTheDocument();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'handles encoded domain names', () => {
		const pageContext = {
			params: {
				domain: encodeURIComponent( 'test.example.com' ),
			},
			primary: null,
		};

		domainController.domainManagementV2( pageContext, mockNext );

		const { container } = render( pageContext.primary as React.ReactElement );
		expect( container ).toBeInTheDocument();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'renders DomainManagementData with correct props', () => {
		const pageContext = {
			params: {
				domain: 'example.com',
			},
			primary: null,
		};

		domainController.domainManagementV2( pageContext, mockNext );

		const { container } = render( pageContext.primary as React.ReactElement );
		expect( container ).toBeInTheDocument();
		expect( pageContext.primary.props ).toMatchObject( {
			analyticsPath: '/domains/manage',
			analyticsTitle: 'Domain Management',
			selectedDomainName: 'example.com',
			needsDomains: true,
			context: pageContext,
		} );
	} );
} );

// Mock dependencies
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { show: jest.fn() },
} ) );

window.IntersectionObserver = jest.fn( () => ( {
	observe: jest.fn(),
	disconnect: jest.fn(),
	root: null,
	rootMargin: '',
	thresholds: [],
	takeRecords: jest.fn(),
	unobserve: jest.fn(),
} ) );

function createState( siteId = 1 ) {
	return {
		currentUser: {
			capabilities: {
				[ siteId ]: {
					publish_posts: true,
				},
			},
		},
		sites: {
			plans: {
				[ siteId ]: {},
			},
		},
		ui: {
			selectedSiteId: siteId,
		},
	};
}

describe( 'domainManagementPaneView', () => {
	const mockNext = jest.fn();
	const mockStore = configureStore();
	const testStore = mockStore( createState() );

	beforeEach( () => {
		jest.clearAllMocks();
		getSelectedSiteSlug.mockImplementation( () => 'example.wordpress.com' );
		getSite.mockImplementation( () => ( {
			ID: 123,
			URL: 'https://example.com',
			title: 'Example Site',
			name: 'Example Site',
			slug: 'example.wordpress.com',
			lang: 'en',
			icon: { img: '', ico: '', media_id: 0 },
			jetpack: false,
			launch_status: 'launched',
			is_coming_soon: false,
			is_private: false,
			is_deleted: false,
			visible: true,
			p2_thumbnail_elements: {
				color_link: '#000000',
				color_sidebar_background: '#ffffff',
				header_image: null,
			},
			options: {
				admin_url: 'https://example.com/wp-admin',
				wpcom_admin_interface: 'wp-admin',
			},
		} ) );
	} );

	it( 'sets up page context with domain overview pane', () => {
		const pageContext = {
			params: {
				domain: 'example.com',
			},
			primary: <div>Previous Content</div>,
			store: testStore,
			query: {
				page: undefined,
				perPage: undefined,
				search: undefined,
				sortField: undefined,
				sortDirection: undefined,
			},
		};

		const paneViewHandler = domainController.domainManagementPaneView( DOMAIN_OVERVIEW );
		paneViewHandler( pageContext, mockNext );

		const { container } = render(
			<Provider store={ testStore }>{ pageContext.primary as React.ReactElement }</Provider>
		);
		expect( container ).toBeInTheDocument();
		expect( mockNext ).toHaveBeenCalled();
		expect( getSelectedSiteSlug ).toHaveBeenCalledWith( {
			currentUser: {
				capabilities: {
					'1': {
						publish_posts: true,
					},
				},
			},
			sites: {
				plans: {
					'1': {},
				},
			},
			ui: {
				selectedSiteId: 1,
			},
		} );
		expect( getSite ).toHaveBeenCalled();
	} );

	it( 'handles encoded domain names in pane view', () => {
		const pageContext = {
			params: {
				domain: encodeURIComponent( 'test.example.com' ),
			},
			primary: <div>Previous Content</div>,
			store: testStore,
			query: {
				page: undefined,
				perPage: undefined,
				search: undefined,
				sortField: undefined,
				sortDirection: undefined,
			},
		};

		const paneViewHandler = domainController.domainManagementPaneView( DOMAIN_OVERVIEW );
		paneViewHandler( pageContext, mockNext );

		const { container } = render(
			<Provider store={ testStore }>{ pageContext.primary as React.ReactElement }</Provider>
		);
		expect( container ).toBeInTheDocument();
		expect( pageContext.primary.props ).toMatchObject( {
			selectedDomain: 'test.example.com',
			selectedFeature: DOMAIN_OVERVIEW,
			siteSlug: 'example.wordpress.com',
		} );
	} );
} );
