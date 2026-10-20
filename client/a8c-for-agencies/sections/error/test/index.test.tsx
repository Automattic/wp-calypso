/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import page, { type Callback, type Context } from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { redirectLoggedOut } from 'calypso/controller/index.web';
import Layout from 'calypso/layout';
import { load } from 'calypso/sections-helper';
import { setupRoutes } from 'calypso/sections-middleware';
import registerRoutes from '..';
import development from '../../../../../config/a8c-for-agencies-development.json';
import horizon from '../../../../../config/a8c-for-agencies-horizon.json';
import production from '../../../../../config/a8c-for-agencies-production.json';
import stage from '../../../../../config/a8c-for-agencies-stage.json';
import { errorContext } from '../controller';
import { getErrorPreset } from '../presets';

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();
	return { __esModule: true, default: Object.assign( mockConfig, { isEnabled: () => false } ) };
} );
jest.mock( '@automattic/calypso-router', () => ( { __esModule: true, default: jest.fn() } ) );
jest.mock( 'calypso/controller/index.web', () => ( {
	redirectLoggedOut: jest.fn(),
	setSectionMiddleware: () => jest.fn(),
} ) );
jest.mock( 'calypso/controller/web-util', () => ( { render: jest.fn() } ) );
jest.mock( 'calypso/sections-helper', () => ( {
	load: jest.fn(),
	receiveSections: jest.fn(),
} ) );
jest.mock( 'calypso/layout', () => jest.fn( () => null ) );
jest.mock( 'calypso/layout/error', () => ( {} ) );
jest.mock( 'calypso/lib/performance-tracking', () => ( {} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.requireActual( 'react-redux' ).useDispatch,
} ) );
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'TRACKS' } ) ),
	bumpStat: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/actions', () => ( {
	setSectionLoading: () => ( { type: 'SECTION_LOADING' } ),
} ) );
jest.mock( 'calypso/state/ui/layout-focus/actions', () => ( {
	activateNextLayoutFocus: () => ( { type: 'LAYOUT_FOCUS' } ),
} ) );
jest.mock( 'calypso/components/data/document-head', () => jest.fn( () => null ) );
jest.mock( 'calypso/a8c-for-agencies/components/a4a-page-view-tracker', () => () => null );

const mockPage = jest.mocked< ( path: string | RegExp, ...callbacks: Callback[] ) => void >( page );
const pathname = '/error';
const genericMessage = 'We couldn’t complete your request. Please try again.';

function renderErrorPage( querystring: string, loggedIn = false ) {
	const context = {
		querystring,
		store: {
			dispatch: jest.fn(),
			getState: () => ( { currentUser: { user: loggedIn ? { ID: 1 } : null } } ),
			subscribe: () => () => {},
		},
	} as unknown as Context;
	const next = jest.fn();
	registerRoutes();
	const [ , renderPage ] = mockPage.mock.calls[ 0 ];
	renderPage( context, next );
	render( context.layout );
	return next;
}

describe( 'public error route', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [ development, horizon, stage, production ] )(
		'is registered without the login guard in $env_id',
		async ( environment ) => {
			jest.mocked( config ).mockImplementation( ( key ) =>
				key === 'sections'
					? {
							'a8c-for-agencies-error': environment.sections[ 'a8c-for-agencies-error' ],
						}
					: environment[ key as keyof typeof environment ]
			);
			jest.mocked( load ).mockResolvedValue( { default: registerRoutes } );
			setupRoutes();
			const sectionRoute = mockPage.mock.calls.find(
				( [ path ] ) => path instanceof RegExp && path.test( pathname )
			);
			expect( sectionRoute ).toBeDefined();
			const context = { store: { dispatch: jest.fn() } } as unknown as Context;
			await ( sectionRoute?.[ 1 ] as Callback )( context, jest.fn() );

			expect( redirectLoggedOut ).not.toHaveBeenCalled();
		}
	);

	it.each( [ false, true ] )( 'renders the standalone page with loggedIn=%s', ( loggedIn ) => {
		const next = renderErrorPage( 'code=a4a_pressable_titan_redirect_expired', loggedIn );
		expect( mockPage ).toHaveBeenCalledWith( pathname, errorContext, expect.any( Function ) );

		expect( screen.getByRole( 'heading', { name: 'Checkout link expired' } ) ).toBeVisible();
		expect( jest.mocked( DocumentHead ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			title: 'Checkout link expired',
		} );
		expect(
			screen.getByText( 'This link has expired. Request a new link from Pressable.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Return to Pressable' } ) ).toHaveAttribute(
			'href',
			'https://my.pressable.com/'
		);
		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( Layout ).not.toHaveBeenCalled();
	} );

	it( 'gives the explicit middleware unknown preset its Pressable recovery action', () => {
		renderErrorPage( 'code=a4a_pressable_titan_unknown' );

		expect( screen.getByRole( 'heading', { name: 'Something went wrong' } ) ).toBeVisible();
		expect(
			screen.getByText( 'We couldn’t open checkout. Please try again from Pressable.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Return to Pressable' } ) ).toHaveAttribute(
			'href',
			'https://my.pressable.com/'
		);
	} );

	it( 'overrides only the neutral preset action when Pressable is explicitly selected', () => {
		renderErrorPage( 'code=a4a_pressable_titan_unrecognized&return_to=pressable' );

		expect( screen.getByRole( 'heading', { name: 'Something went wrong' } ) ).toBeVisible();
		expect( screen.getByText( genericMessage ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Return to Pressable' } ) ).toHaveAttribute(
			'href',
			'https://my.pressable.com/'
		);
	} );

	it( 'overrides only the known preset action when home is explicitly selected', () => {
		renderErrorPage( 'code=a4a_pressable_titan_redirect_expired&return_to=home' );

		expect( screen.getByRole( 'heading', { name: 'Checkout link expired' } ) ).toBeVisible();
		expect(
			screen.getByText( 'This link has expired. Request a new link from Pressable.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Return home' } ) ).toHaveAttribute( 'href', '/' );
	} );

	it( 'renders the neutral home preset for a prototype-like code', () => {
		renderErrorPage( 'code=__proto__' );

		expect( screen.getByRole( 'heading', { name: 'Something went wrong' } ) ).toBeVisible();
		expect( screen.getByText( genericMessage ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Return home' } ) ).toHaveAttribute( 'href', '/' );
	} );

	it.each( [
		'return_to=unknown',
		'return_to=home&return_to=pressable',
		'return_to=%ZZ',
		'return_to=https%3A%2F%2Fmy.pressable.com%2F',
		'return_to=https%3A%2F%2Fevil.example%2F&return_url=https%3A%2F%2Fevil.example%2F&return_label=Continue',
	] )( 'preserves the preset action for an unsupported override: %s', ( querystring ) => {
		renderErrorPage( `code=a4a_pressable_titan_redirect_expired&${ querystring }` );

		expect( screen.getByRole( 'link', { name: 'Return to Pressable' } ) ).toHaveAttribute(
			'href',
			'https://my.pressable.com/'
		);
	} );

	it.each( [
		[
			'a4a_pressable_titan_redirect_rejected',
			'Unable to verify checkout',
			'The redirect could not be verified.',
		],
		[
			'a4a_pressable_titan_unauthorized_buyer',
			'Unable to access checkout',
			'The buyer doesn’t have permission to purchase inboxes for this agency. Contact an agency owner or manager.',
		],
		[
			'a4a_pressable_titan_cart_mismatch',
			'Unable to prepare checkout',
			'We couldn’t prepare your inbox order for checkout. Please try again from Pressable.',
		],
	] )( 'renders the %s preset title, subtitle and action', ( code, title, subtitle ) => {
		renderErrorPage( `code=${ code }` );

		expect( screen.getByRole( 'heading', { name: title } ) ).toBeVisible();
		expect( screen.getByText( subtitle ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Return to Pressable' } ) ).toHaveAttribute(
			'href',
			'https://my.pressable.com/'
		);
	} );

	it( 'uses the complete neutral preset for missing, internal, unknown, malformed and repeated codes', () => {
		for ( const querystring of [
			'',
			'code=internal_error',
			'code=invalid_timestamp',
			'code=titan_billing_plan_mismatch',
			'code=pressable_redirect_expired',
			'code=a4a_pressable_titan_unrecognized',
			'code=__proto__',
			'code=constructor',
			'code=toString',
			'code=unknown',
			'code=%ZZ',
			'code=<img src=x onerror=alert(1)>',
			'code=a4a_pressable_titan_redirect_expired&code=a4a_pressable_titan_redirect_expired',
			'code=unknown&code=a4a_pressable_titan_redirect_expired',
		] ) {
			expect( getErrorPreset( querystring, __ ) ).toEqual( {
				title: 'Something went wrong',
				subtitle: genericMessage,
				buttonText: 'Return home',
				buttonUrl: '/',
			} );
		}
	} );
} );
