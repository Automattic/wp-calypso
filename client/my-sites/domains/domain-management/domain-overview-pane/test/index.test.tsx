/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { DOMAIN_OVERVIEW } from '../constants';
import DomainOverviewPane, { showDomainManagementPage } from '../index';

// Mock dependencies
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { show: jest.fn() },
} ) );

jest.mock( 'calypso/state/sites/hooks', () => ( {
	useSiteAdminInterfaceData: () => ( {
		adminLabel: 'WP Admin',
		adminUrl: 'https://example.com/wp-admin',
	} ),
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

describe( 'DomainOverviewPane', () => {
	const defaultProps = {
		selectedDomainPreview: <div>Domain Preview</div>,
		selectedDomain: 'example.com',
		selectedFeature: DOMAIN_OVERVIEW,
		siteSlug: 'example.wordpress.com',
		site: {
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
				is_domain_only: false,
				is_automated_transfer: false,
				is_wpcom_store: false,
				is_wpforteams_site: false,
				wpcom_admin_interface: 'wp-admin',
			},
		},
	};

	beforeEach( () => {
		global.window.location = new URL( 'https://wordpress.com' ) as any;
		jest.clearAllMocks();
	} );

	const renderComponent = ( props = {} ) => {
		const mockStore = configureStore();
		const store = mockStore( createState() );
		return render(
			<Provider store={ store }>
				<DomainOverviewPane { ...defaultProps } { ...props } />
			</Provider>
		);
	};

	it( 'renders the component with default tab selected', () => {
		renderComponent();
		expect( screen.getByText( 'Domain Preview' ) ).toBeInTheDocument();
	} );

	it( 'renders admin button with correct label', () => {
		renderComponent();
		expect( screen.getByText( 'Manage site' ) ).toBeInTheDocument();
	} );

	it( 'handles tab switching', () => {
		renderComponent();
		fireEvent.click( screen.getByText( 'Email' ) );
		expect( page.show ).toHaveBeenCalledWith(
			'/domains/manage/all/email/example.com/example.wordpress.com'
		);
	} );

	it( 'handles close button click', () => {
		renderComponent();
		fireEvent.click( screen.getByText( 'Close' ) );
		expect( page.show ).toHaveBeenCalledWith( '/domains/manage' );
	} );
} );

describe( 'showDomainManagementPage', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'preserves supported URL parameters when navigating', () => {
		const url = new URL( 'https://wordpress.com?page=2&search=test&status=active' );
		jest.spyOn( window, 'location', 'get' ).mockReturnValue( url as any );

		showDomainManagementPage( '/domains/manage/example.com' );
		expect( page.show ).toHaveBeenCalledWith(
			'/domains/manage/example.com?page=2&search=test&status=active'
		);
	} );
} );
