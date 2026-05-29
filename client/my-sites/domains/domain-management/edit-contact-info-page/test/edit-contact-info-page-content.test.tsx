/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import configureStore from 'redux-mock-store';
import { buildDomainResponse } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/launchpad/test/lib/fixtures';
import { whoisType } from 'calypso/lib/domains/whois/constants';
import EditContactInfoPageContent from '../edit-contact-info-page-content';
import EditContactInfoPage from '../index';

jest.mock( 'calypso/data/domains/transfers/use-domain-transfer-request-query', () => ( {
	__esModule: true,
	default: () => ( { data: null } ),
} ) );

jest.mock( '@automattic/viewport-react', () => ( {
	...jest.requireActual( '@automattic/viewport-react' ),
	useDesktopBreakpoint: () => true,
} ) );

describe( 'EditContactInfoPageContent', () => {
	const renderComponent = ( props = {} ) => {
		const defaultProps = {
			currentRoute: '',
			domains: [],
			selectedDomainName: '',
			selectedSite: {
				slug: 'example.com',
			},
			isCard: false,
		};

		const initialState = {
			currentUser: { user: { email: 'test@example.com' } },
			countries: { domains: [] },
			domains: {
				management: {
					items: {
						mydomain: [
							{
								fname: 'test',
								type: whoisType.REGISTRANT,
							},
						],
					},
				},
			},
		};

		const store = createStore( ( state ) => state, initialState );

		return render(
			<Provider store={ store }>
				<EditContactInfoPageContent { ...defaultProps } { ...props } />
			</Provider>
		);
	};

	it( "should render notice when user can't manage the domain", () => {
		const { container } = renderComponent( {
			domains: [ buildDomainResponse( { currentUserCanManage: false } ) ],
		} );

		expect( container.textContent ).toContain( 'These settings can be changed by the user' );
	} );

	it( "should render notice when the user can't update the contact info", () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: false,
					cannotUpdateContactInfoReason: 'reason',
				} ),
			],
		} );

		expect( container.textContent ).toContain( 'reason' );
	} );

	it( 'should render notice when the domain is pending a whois update', () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: true,
					isPendingWhoisUpdate: true,
				} ),
			],
		} );

		expect( container.textContent ).toContain( 'Domain is pending contact information update.' );
	} );

	it( 'should render remove privacy notice when the domain is private', () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: true,
					mustRemovePrivacyBeforeContactUpdate: true,
					privateDomain: true,
				} ),
			],
		} );

		expect( container.textContent ).toContain(
			'This domain is currently using Privacy Protection'
		);
	} );

	it( 'should render the edit form when the user can edit', () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: true,
					mustRemovePrivacyBeforeContactUpdate: false,
					domainRegistrationAgreementUrl: 'url',
					name: 'mydomain',
				} ),
			],
			selectedDomainName: 'mydomain',
		} );

		expect( container.firstChild.tagName ).toBe( 'FORM' );
	} );
} );

describe( 'EditContactInfoPage', () => {
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

	const pageInitialState = {
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

	const renderPage = ( props = {} ) => {
		const store = mockStore( pageInitialState );
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

	it( 'should render breadcrumb header by default', () => {
		const { container } = renderPage();
		const breadcrumbs = container.querySelector( '.breadcrumbs' );

		expect( breadcrumbs ).toBeInTheDocument();
		expect( breadcrumbs.textContent ).toContain( 'Domains' );
		expect( breadcrumbs.textContent ).toContain( domainName );
		expect( breadcrumbs.textContent ).toContain( 'Edit contact information' );
	} );

	it( 'should hide breadcrumb header when showPageHeader is false', () => {
		const { container } = renderPage( {
			context: { params: { showPageHeader: false } },
		} );

		expect( container.querySelector( '.breadcrumbs' ) ).not.toBeInTheDocument();
	} );

	it( 'should render placeholder when domain data is loading', () => {
		const { container } = renderPage( { domains: [] } );

		expect( container.querySelector( '.domain__main-placeholder' ) ).toBeInTheDocument();
		expect( container.querySelector( '.breadcrumbs' ) ).not.toBeInTheDocument();
	} );
} );
