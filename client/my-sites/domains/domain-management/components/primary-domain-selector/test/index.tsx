/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import PrimaryDomainSelector from '../index';

// Mock dependencies
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'calypso/components/inline-support-link' );

const mockStore = configureMockStore();

describe( 'PrimaryDomainSelector', () => {
	const defaultProps = {
		onSetPrimaryDomain: jest.fn(),
		domains: [
			{
				domain: 'primary.com',
				primary_domain: true,
				can_set_as_primary: true,
				type: 'registered',
			},
			{
				domain: 'secondary.com',
				primary_domain: false,
				can_set_as_primary: true,
				type: 'registered',
			},
			{
				domain: 'cannot-be-primary.com',
				primary_domain: false,
				can_set_as_primary: false,
				type: 'registered',
			},
		],
		site: {
			plan: {
				is_free: false,
				features: {
					active: [ FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ],
				},
			},
		},
	};

	const renderComponent = ( props = {}, storeState = {} ) => {
		const store = mockStore( {
			currentUser: {
				flags: [ NON_PRIMARY_DOMAINS_TO_FREE_USERS ],
			},
			...storeState,
		} );

		return render(
			<Provider store={ store }>
				<PrimaryDomainSelector { ...defaultProps } { ...props } />
			</Provider>
		);
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the primary domain message', () => {
		renderComponent();
		expect(
			screen.getByText( /The current primary address set for this site is:/i )
		).toBeInTheDocument();
		expect( screen.getByText( 'primary.com' ) ).toBeInTheDocument();
	} );

	it( 'renders the domain selector with valid options', () => {
		renderComponent();
		const select = screen.getByRole( 'combobox' );
		expect( select ).toBeInTheDocument();
		expect( screen.getByText( 'secondary.com' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'cannot-be-primary.com' ) ).not.toBeInTheDocument();
	} );

	it( 'enables the submit button only when a domain is selected', () => {
		renderComponent();
		const submitButton = screen.getByRole( 'button', { name: /set as primary/i } );
		expect( submitButton ).toBeDisabled();

		const select = screen.getByRole( 'combobox' );
		fireEvent.change( select, { target: { value: 'secondary.com' } } );

		expect( submitButton ).toBeEnabled();
	} );

	it( 'calls onSetPrimaryDomain when form is submitted', () => {
		renderComponent();
		const select = screen.getByRole( 'combobox' );
		const submitButton = screen.getByRole( 'button', { name: /set as primary/i } );

		fireEvent.change( select, { target: { value: 'secondary.com' } } );
		fireEvent.click( submitButton );

		expect( defaultProps.onSetPrimaryDomain ).toHaveBeenCalledWith(
			'secondary.com',
			expect.any( Function ),
			'registered'
		);
	} );

	it( 'shows upgrade message for free plan users', () => {
		renderComponent(
			{
				site: {
					plan: {
						is_free: true,
					},
				},
			},
			{
				currentUser: {
					flags: [ NON_PRIMARY_DOMAINS_TO_FREE_USERS ],
				},
			}
		);

		expect(
			screen.getByText(
				/Your site plan doesn't allow to set a custom domain as a primary site address/i
			)
		).toBeInTheDocument();
		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	} );

	it( 'shows add domain message when no valid domains are available', () => {
		renderComponent( {
			domains: [
				{
					domain: 'primary.com',
					primary_domain: true,
					can_set_as_primary: true,
					type: 'registered',
				},
			],
		} );

		expect(
			screen.getByText( /Before changing your primary site address you must/i )
		).toBeInTheDocument();
		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	} );

	it( 'tracks upgrade click events', () => {
		renderComponent(
			{
				site: {
					plan: {
						is_free: true,
					},
				},
			},
			{
				currentUser: {
					flags: [ NON_PRIMARY_DOMAINS_TO_FREE_USERS ],
				},
			}
		);

		const upgradeLink = screen.getByText( 'Upgrade your plan' );
		fireEvent.click( upgradeLink );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_primary_site_address_nudge_cta_click',
			{
				cta_name: 'buy_a_plan',
			}
		);
	} );

	it( 'handles staging domains correctly', () => {
		renderComponent( {
			domains: [
				{
					domain: 'staging.wordpress.com',
					primary_domain: false,
					can_set_as_primary: true,
					type: 'wpcom',
					is_wpcom_staging_domain: true,
					wpcom_domain: true,
				},
				{
					domain: 'regular.wordpress.com',
					primary_domain: false,
					can_set_as_primary: true,
					type: 'wpcom',
					wpcom_domain: true,
				},
				{
					domain: 'custom.com',
					primary_domain: false,
					can_set_as_primary: true,
					type: 'registered',
				},
			],
		} );

		const options = screen.getAllByRole( 'option' );

		// Should only show staging domain and custom domain, not regular wpcom domain
		expect( options ).toHaveLength( 3 ); // Including the "Select a domain" option
		expect( screen.queryByText( 'regular.wordpress.com' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'custom.com' ) ).toBeInTheDocument();
	} );
} );
