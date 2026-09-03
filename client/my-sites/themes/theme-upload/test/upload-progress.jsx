/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useWaitHeartbeat } from 'calypso/lib/analytics/wait-heartbeat';
import ThemeUploadProgress from '../upload-progress';

const mockSetOpenOdieWithContext = jest.fn();
let mockIsWpMobileApp = false;

jest.mock( 'calypso/lib/mobile-app', () => ( { isWpMobileApp: () => mockIsWpMobileApp } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/wait-heartbeat', () => ( { useWaitHeartbeat: jest.fn() } ) );
jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'automattic/help-center' },
} ) );
// `@automattic/components` pulls in `@wordpress/rich-text`, which registers a store on import, so
// the mock has to cover the registration surface and not only the dispatch this component uses.
jest.mock( '@wordpress/data', () => {
	const noop = () => ( {} );
	const identity = ( fn ) => fn;
	return {
		useDispatch: () => ( { setOpenOdieWithContext: mockSetOpenOdieWithContext } ),
		useSelect: ( selector ) => selector( () => undefined ),
		combineReducers: ( reducers ) => reducers,
		createSelector: identity,
		createReduxStore: noop,
		createRegistrySelector: identity,
		register: noop,
		registerStore: noop,
		use: noop,
		plugins: { persistence: noop },
		dispatch: () => ( {} ),
		select: () => ( {} ),
		subscribe: () => () => {},
	};
} );

const defaults = {
	siteId: 1,
	siteSlug: 'example.wordpress.com',
	siteUrl: 'https://example.wordpress.com',
	themeId: 'my-theme',
	installing: true,
	isJetpack: false,
	progressLoaded: 100,
	progressTotal: 100,
};
const renderProgress = ( props ) => render( <ThemeUploadProgress { ...defaults } { ...props } /> );
const elapse = ( ms ) => act( () => jest.advanceTimersByTime( ms ) );

describe( 'ThemeUploadProgress', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsWpMobileApp = false;
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-26T10:00:00Z' ) );
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'counts real bytes while the file is still uploading', () => {
		renderProgress( { installing: false, progressLoaded: 20, progressTotal: 100 } );
		expect( screen.getByText( 'Uploading your theme…' ) ).toBeVisible();
	} );

	it( 'names the transfer while the install runs on a Simple site', () => {
		renderProgress();
		expect( screen.getByText( 'Configuring your site…' ) ).toBeVisible();
	} );

	it( 'names the install instead on a Jetpack site', () => {
		renderProgress( { isJetpack: true } );
		expect( screen.getByText( 'Installing your theme…' ) ).toBeVisible();
	} );

	it( 'keeps waiting for a transfer that is merely slow', () => {
		renderProgress();
		elapse( 179_000 );
		expect( screen.getByText( 'Configuring your site…' ) ).toBeVisible();
		expect( screen.queryByText( /taking longer than expected/ ) ).not.toBeInTheDocument();
	} );

	it( 'ends the wait in a verdict once the install phase passes its deadline', () => {
		renderProgress();
		elapse( 181_000 );
		expect( screen.getByText( /taking longer than expected/ ) ).toBeVisible();
		expect( screen.queryByText( 'Configuring your site…' ) ).not.toBeInTheDocument();
	} );

	it( 'offers a way out of the timed-out wait', () => {
		renderProgress();
		elapse( 181_000 );
		expect( screen.getByRole( 'link', { name: 'Go to themes' } ) ).toHaveAttribute(
			'href',
			'/themes/example.wordpress.com'
		);
	} );

	it( 'opens the Help Center in place, carrying the site and the failure into the chat', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		renderProgress();
		elapse( 181_000 );
		const contact = screen.getByRole( 'button', { name: 'Contact support' } );
		expect( contact ).not.toHaveAttribute( 'href' );

		await user.click( contact );
		expect( mockSetOpenOdieWithContext ).toHaveBeenCalledWith(
			expect.objectContaining( {
				section: 'themes',
				siteId: 1,
				siteUrl: 'https://example.wordpress.com',
				initialMessage: expect.stringContaining( 'stuck' ),
			} )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_theme_upload_wait_timeout_click', {
			action: 'contact_support',
			site_id: 1,
		} );
	} );

	// The mobile app never mounts the Help Center, so the dispatch would be a dead click there.
	it( 'links out to support instead in the mobile app, where the Help Center is absent', async () => {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		mockIsWpMobileApp = true;
		renderProgress();
		elapse( 181_000 );

		const contact = screen.getByRole( 'link', { name: 'Contact support' } );
		expect( contact ).toHaveAttribute( 'href', 'https://wordpress.com/support/' );

		await user.click( contact );
		expect( mockSetOpenOdieWithContext ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_theme_upload_wait_timeout_click', {
			action: 'contact_support',
			site_id: 1,
		} );
	} );

	// `installing` is derived from two progress figures that are both undefined at mount, so it
	// reads true before a single byte is reported. Arming the deadline there would time out an
	// upload that is still perfectly healthy.
	it( 'does not arm the deadline before the upload has reported any progress', () => {
		renderProgress( { progressLoaded: undefined, progressTotal: undefined } );
		elapse( 300_000 );
		expect( screen.getByText( 'Uploading your theme…' ) ).toBeVisible();
		expect( screen.queryByText( /taking longer than expected/ ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	// The upload phase reports real progress, so a slow one is not the silent wait this bounds.
	it( 'does not run the deadline while the file is still uploading', () => {
		renderProgress( { installing: false } );
		elapse( 300_000 );
		expect( screen.getByText( 'Uploading your theme…' ) ).toBeVisible();
		expect( screen.queryByText( /taking longer than expected/ ) ).not.toBeInTheDocument();
	} );

	it( 'records the timeout once, not on every tick', () => {
		renderProgress();
		elapse( 179_000 );
		expect( recordTracksEvent ).not.toHaveBeenCalled();

		elapse( 5_000 );
		elapse( 30_000 );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_theme_upload_wait_timeout', {
			site_id: 1,
			theme_id: 'my-theme',
			is_jetpack: false,
		} );
	} );

	// Mirrors how the page mounts this: keyed by site, so a site switch mid-upload cannot inherit
	// the previous site's clock, verdict or heartbeat.
	it( 'starts the next site fresh instead of inheriting a timed-out wait', () => {
		const Wrapper = ( { siteId } ) => (
			<ThemeUploadProgress { ...defaults } key={ siteId } siteId={ siteId } />
		);
		const { rerender } = render( <Wrapper siteId={ 1 } /> );
		elapse( 181_000 );
		expect( screen.getByText( /taking longer than expected/ ) ).toBeVisible();

		rerender( <Wrapper siteId={ 2 } /> );
		expect( screen.getByText( 'Configuring your site…' ) ).toBeVisible();
		expect( screen.queryByText( /taking longer than expected/ ) ).not.toBeInTheDocument();
	} );

	it( 'beats for the theme_upload surface, and stops once the wait has a verdict', () => {
		renderProgress();
		expect( useWaitHeartbeat ).toHaveBeenLastCalledWith(
			expect.objectContaining( { surface: 'theme_upload', enabled: true } )
		);

		elapse( 181_000 );
		expect( useWaitHeartbeat ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				enabled: false,
				properties: expect.objectContaining( { outcome: 'timeout' } ),
			} )
		);
	} );
} );
