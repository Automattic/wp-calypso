/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import page, { type Callback, type Context } from '@automattic/calypso-router';
import { cleanup, render, screen } from '@testing-library/react';
import { redirectLoggedOut } from 'calypso/controller/index.web';
import { load } from 'calypso/sections-helper';
import { setupRoutes } from 'calypso/sections-middleware';
import registerRoutes from '..';
import development from '../../../../../config/a8c-for-agencies-development.json';

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

function renderErrorPage( querystring: string ) {
	const context = {
		querystring,
		store: {
			dispatch: jest.fn(),
			getState: () => ( { currentUser: { user: null } } ),
			subscribe: () => () => {},
		},
	} as unknown as Context;
	const [ , renderPage ] = mockPage.mock.calls.find( ( [ path ] ) => path === pathname )!;
	renderPage( context, jest.fn() );
	render( context.layout );
}

it( 'shows a public error preset, return override and neutral fallback', async () => {
	jest
		.mocked( config )
		.mockImplementation( ( key ) =>
			key === 'sections'
				? { 'a8c-for-agencies-error': development.sections[ 'a8c-for-agencies-error' ] }
				: development[ key as keyof typeof development ]
		);
	jest.mocked( load ).mockResolvedValue( { default: registerRoutes } );
	setupRoutes();
	const [ , loadSection ] = mockPage.mock.calls.find(
		( [ path ] ) => path instanceof RegExp && path.test( pathname )
	)!;
	await loadSection( { store: { dispatch: jest.fn() } } as unknown as Context, jest.fn() );
	expect( redirectLoggedOut ).not.toHaveBeenCalled();

	renderErrorPage( 'code=a4a_pressable_titan_redirect_expired' );
	expect( screen.getByRole( 'heading', { name: 'Checkout link expired' } ) ).toBeVisible();
	expect(
		screen.getByText( 'This link has expired. Request a new link from Pressable.' )
	).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'Return to Pressable' } ) ).toHaveAttribute(
		'href',
		'https://my.pressable.com/'
	);

	cleanup();
	renderErrorPage( 'code=a4a_pressable_titan_redirect_expired&return_to=home' );
	expect( screen.getByRole( 'link', { name: 'Return home' } ) ).toHaveAttribute( 'href', '/' );

	cleanup();
	renderErrorPage( 'code=unrecognized' );
	expect( screen.getByRole( 'heading', { name: 'Something went wrong' } ) ).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'Return home' } ) ).toHaveAttribute( 'href', '/' );
} );
