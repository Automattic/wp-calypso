/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import TitanControlPanelModal from '../titan-control-panel-modal';

const DOMAIN = 'example.com';
const ORDER_ID = 4242;
const AUTO_LOGIN_URL = 'https://manage.titan.email/auto-login?token=abc';

function mockDomain( titanOrderId: number | null ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ DOMAIN }` )
		.query( true )
		.reply( 200, {
			domain: DOMAIN,
			titan_mail_subscription: titanOrderId ? { order_id: titanOrderId } : null,
		} );
}

function mockAutoLoginUrl( expectedContext?: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/emails/titan/${ ORDER_ID }/control-panel-auto-login-url` )
		.query( ( query ) => query.context === expectedContext )
		.reply( 200, { auto_login_url: AUTO_LOGIN_URL } );
}

/**
 * The shared dashboard test setup stubs matchMedia to never match, so every
 * viewport query reports a small screen by default. `useMediaQuery` caches the
 * MediaQueryList per window and query for the lifetime of the module, so the
 * stubs have to be mutated in place rather than replaced between tests.
 */
const mediaQueryLists = new Map< string, MediaQueryList >();

function mockViewport( matches: boolean ) {
	( window.matchMedia as jest.Mock ).mockImplementation( ( query: string ) => {
		let mediaQueryList = mediaQueryLists.get( query );
		if ( ! mediaQueryList ) {
			mediaQueryList = {
				matches,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} as unknown as MediaQueryList;
			mediaQueryLists.set( query, mediaQueryList );
		}
		return mediaQueryList;
	} );

	for ( const mediaQueryList of mediaQueryLists.values() ) {
		( mediaQueryList as { matches: boolean } ).matches = matches;
	}
}

const useLargeViewport = () => mockViewport( true );

/**
 * SummaryButton stays focusable while disabled, so it marks the state with
 * aria-disabled rather than the disabled attribute.
 */
async function findEnabledButton( name: RegExp ) {
	const button = await screen.findByRole( 'button', { name } );
	await waitFor( () => expect( button ).not.toHaveAttribute( 'aria-disabled', 'true' ) );
	return button;
}

describe( '<TitanControlPanelModal>', () => {
	let openedWindow: { location: { href: string }; close: jest.Mock };

	beforeEach( () => {
		mockViewport( false );
		openedWindow = { location: { href: '' }, close: jest.fn() };
		jest.spyOn( window, 'open' ).mockReturnValue( openedWindow as unknown as Window );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	test( 'lists every control panel destination from the classic Manage all mailboxes page', async () => {
		useLargeViewport();
		mockDomain( ORDER_ID );
		render( <TitanControlPanelModal domainName={ DOMAIN } /> );

		await findEnabledButton( /Open control panel/ );

		for ( const name of [
			/Configure desktop app/,
			/Get mobile app/,
			/Import email data/,
			/Configure catch-all email/,
			/Set up internal forwarding/,
		] ) {
			expect( screen.getByRole( 'button', { name } ) ).toBeVisible();
		}
	} );

	test( 'opens the control panel in a new tab using a single-use auto-login URL', async () => {
		useLargeViewport();
		mockDomain( ORDER_ID );
		const scope = mockAutoLoginUrl();
		const user = userEvent.setup();
		render( <TitanControlPanelModal domainName={ DOMAIN } /> );

		await user.click( await findEnabledButton( /Open control panel/ ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		// The tab is opened synchronously on click so pop-up blockers do not reject it.
		expect( window.open ).toHaveBeenCalledWith( '', '_blank' );
		await waitFor( () => expect( openedWindow.location.href ).toBe( AUTO_LOGIN_URL ) );
	} );

	test( 'deep-links to the requested control panel section', async () => {
		useLargeViewport();
		mockDomain( ORDER_ID );
		const scope = mockAutoLoginUrl( 'configure_catch_all_email' );
		const user = userEvent.setup();
		render( <TitanControlPanelModal domainName={ DOMAIN } /> );

		await user.click( await findEnabledButton( /Configure catch-all email/ ) );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'closes the blank tab and warns when the auto-login URL cannot be fetched', async () => {
		useLargeViewport();
		mockDomain( ORDER_ID );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/emails/titan/${ ORDER_ID }/control-panel-auto-login-url` )
			.query( true )
			.reply( 500, { message: 'Something went wrong' } );
		const user = userEvent.setup();
		render( <TitanControlPanelModal domainName={ DOMAIN } /> );

		await user.click( await findEnabledButton( /Open control panel/ ) );

		await waitFor( () => expect( openedWindow.close ).toHaveBeenCalled() );
		expect( openedWindow.location.href ).toBe( '' );
	} );

	test( 'disables every destination when the domain has no Titan subscription', async () => {
		useLargeViewport();
		mockDomain( null );
		render( <TitanControlPanelModal domainName={ DOMAIN } /> );

		expect(
			await screen.findByText(
				'We could not find an active Professional Email subscription for this domain.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Open control panel/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'blocks the desktop-only sections on small screens', async () => {
		mockDomain( ORDER_ID );
		render( <TitanControlPanelModal domainName={ DOMAIN } /> );

		expect(
			await screen.findByText(
				'Please switch to a device with a larger screen to access all email management features.'
			)
		).toBeVisible();

		// Reachable anywhere: the control panel itself and the mobile app links.
		await findEnabledButton( /Open control panel/ );
		expect( screen.getByRole( 'button', { name: /Get mobile app/ } ) ).not.toHaveAttribute(
			'aria-disabled',
			'true'
		);

		expect( screen.getByRole( 'button', { name: /Configure catch-all email/ } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );
} );
