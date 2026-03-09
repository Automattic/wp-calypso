/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import InviteAcceptLoggedOut from '../invite-accept-logged-out';

const mockGetCiabConfigFromGarden = jest.fn();

jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component ) => ( props ) => <Component { ...props } translate={ ( text ) => text } />,
} ) );

jest.mock( 'calypso/blocks/signup-form', () => ( {
	__esModule: true,
	default: () => <div data-testid="signup-form" />,
} ) );

jest.mock( 'calypso/components/forms/form-button', () => ( {
	__esModule: true,
	default: ( { children } ) => <button>{ children }</button>,
} ) );

jest.mock( 'calypso/components/logged-out-form/link-item', () => ( {
	__esModule: true,
	default: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( 'calypso/components/logged-out-form/links', () => ( {
	__esModule: true,
	default: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( 'calypso/layout/body-section-css-class', () => ( {
	__esModule: true,
	default: ( { bodyClass } ) => (
		<div data-testid="body-section-css-class">
			{ Array.isArray( bodyClass ) ? bodyClass.join( ' ' ) : '' }
		</div>
	),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/partner-branding', () => ( {
	getCiabConfigFromGarden: ( ...args ) => mockGetCiabConfigFromGarden( ...args ),
} ) );

jest.mock( 'calypso/lib/paths', () => ( {
	login: () => '/log-in',
} ) );

jest.mock( 'calypso/lib/route', () => ( {
	addQueryArgs: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/invites/invite-form-header-logged-out', () => ( {
	__esModule: true,
	default: () => <div data-testid="invite-form-header-logged-out" />,
} ) );

jest.mock( 'calypso/my-sites/invites/p2/invite-accept-logged-out', () => jest.fn() );

jest.mock( 'calypso/signup/wpcom-login-form', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/state/invites/actions', () => ( {
	createAccount: jest.fn(),
	acceptInvite: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/get-current-query-arguments', () => ( {
	__esModule: true,
	default: () => ( {} ),
} ) );

jest.mock( '../invite-accept-logged-out/style.scss', () => ( {} ) );

const mockStore = configureStore();

const buildInvite = ( siteOverrides = {} ) => ( {
	role: 'administrator',
	sentTo: 'invited@example.com',
	knownUser: false,
	site: {
		title: 'Test Store',
		domain: 'test.store',
		URL: 'https://test.store',
		...siteOverrides,
	},
} );

describe( 'InviteAcceptLoggedOut branding', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetCiabConfigFromGarden.mockReturnValue( null );
	} );

	test( 'renders custom partner branding when invite site is Woo commerce garden', () => {
		mockGetCiabConfigFromGarden.mockReturnValue( {
			id: 'woo',
			fontStyle: 'system',
			logo: {
				src: 'https://example.com/woo-logo.png',
				alt: 'Woo',
			},
		} );

		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<InviteAcceptLoggedOut
					invite={ buildInvite( { garden: { name: 'commerce', partner: 'woo' } } ) }
				/>
			</Provider>
		);

		expect( mockGetCiabConfigFromGarden ).toHaveBeenCalledWith( 'woo', 'commerce', {
			persistToSession: true,
		} );
		expect( screen.getByRole( 'img', { name: 'Woo' } ) ).toBeVisible();
		expect( screen.getByTestId( 'body-section-css-class' ) ).toHaveTextContent(
			'is-ciab-font-system'
		);
	} );

	test( 'falls back to WordPress logo for non-CIAB invites', () => {
		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<InviteAcceptLoggedOut
					invite={ buildInvite( { garden: { name: 'enterprise', partner: 'woo' } } ) }
				/>
			</Provider>
		);

		expect( mockGetCiabConfigFromGarden ).toHaveBeenCalledWith( 'woo', 'enterprise', {
			persistToSession: true,
		} );
		expect( screen.queryByRole( 'img', { name: 'Woo' } ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.logged-out-wp-logo' )?.tagName.toLowerCase() ).toBe( 'svg' );
		expect( screen.getByTestId( 'body-section-css-class' ) ).toHaveTextContent( '' );
	} );

	test( 'falls back to WordPress logo when site.garden is missing', () => {
		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<InviteAcceptLoggedOut invite={ buildInvite() } />
			</Provider>
		);

		expect( mockGetCiabConfigFromGarden ).toHaveBeenCalledWith( undefined, undefined, {
			persistToSession: true,
		} );
		expect( screen.queryByRole( 'img', { name: 'Woo' } ) ).not.toBeInTheDocument();
		expect( document.querySelector( '.logged-out-wp-logo' )?.tagName.toLowerCase() ).toBe( 'svg' );
	} );
} );
