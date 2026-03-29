/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { buildDomainResponse } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/launchpad/test/lib/fixtures';
import EditContactInfoPage from '../index';

jest.mock( 'calypso/data/domains/transfers/use-domain-transfer-request-query', () => ( {
	__esModule: true,
	default: () => ( { data: null } ),
} ) );

jest.mock( '@automattic/viewport-react', () => ( {
	...jest.requireActual( '@automattic/viewport-react' ),
	useDesktopBreakpoint: () => true,
} ) );

const domainName = 'example.com';

const domain = buildDomainResponse( {
	name: domainName,
	type: 'registered',
} );

const selectedSite = {
	ID: 1,
	slug: 'example.wordpress.com',
	options: { is_domain_only: false },
};

const initialState = {
	currentUser: { user: { email: 'test@example.com' } },
	sites: {
		items: { 1: selectedSite },
	},
	ui: { selectedSiteId: 1, section: false },
	route: {
		path: {
			current: '/domains/manage/example.wordpress.com/edit-contact-info/example.com',
		},
	},
	domains: {
		management: {
			items: {},
			isRequestingWhois: {},
		},
	},
};

const mockStore = configureStore();

const renderComponent = ( props = {} ) => {
	const store = mockStore( initialState );
	const defaultProps = {
		selectedDomainName: domainName,
		selectedSite,
		domains: [ domain ],
	};

	return render(
		<Provider store={ store }>
			<EditContactInfoPage { ...defaultProps } { ...props } />
		</Provider>
	);
};

describe( 'EditContactInfoPage', () => {
	it( 'should render breadcrumb header by default', () => {
		const { container } = renderComponent();
		const breadcrumbs = container.querySelector( '.breadcrumbs' );

		expect( breadcrumbs ).toBeInTheDocument();
		expect( breadcrumbs.textContent ).toContain( 'Domains' );
		expect( breadcrumbs.textContent ).toContain( domainName );
		expect( breadcrumbs.textContent ).toContain( 'Edit contact information' );
	} );

	it( 'should hide breadcrumb header when showPageHeader is false', () => {
		const { container } = renderComponent( {
			context: { params: { showPageHeader: false } },
		} );

		expect( container.querySelector( '.breadcrumbs' ) ).not.toBeInTheDocument();
	} );

	it( 'should render placeholder when domain data is loading', () => {
		const { container } = renderComponent( { domains: [] } );

		expect( container.querySelector( '.domain__main-placeholder' ) ).toBeInTheDocument();
		expect( container.querySelector( '.breadcrumbs' ) ).not.toBeInTheDocument();
	} );
} );
