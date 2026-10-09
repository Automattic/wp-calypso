/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { init } from '..';
import recordWidgetEvent, { recordWidgetEventThenFollow } from '../record-widget-event';

jest.mock( '@automattic/calypso-polyfills', () => ( {} ) );
jest.mock( '../../lib/config-api', () => ( {
	__esModule: true,
	default: ( key ) => ( { blog_id: 123, gmt_offset: 0, i18n_locale_slug: 'en' } )[ key ],
	optionalConfig: () => undefined,
} ) );
jest.mock( '../../lib/set-locale', () => () => Promise.resolve() );
jest.mock( '../../lib/load-wp-components-style', () => ( {
	loadWpComponentsStyleForWidget: () => Promise.resolve(),
} ) );
jest.mock( '../../lib/selectors/get-site-stats-base-url', () => () => 'https://example.com/stats' );
jest.mock( '../../lib/selectors/get-site-admin-url', () => () => 'https://example.com/wp-admin/' );
jest.mock( 'calypso/my-sites/stats/hooks/use-wp-admin-theme', () => () => null );
jest.mock( '../use-stats-link', () => () => ( url ) => url );
jest.mock( '../mini-chart', () => ( { range, footer } ) => (
	<>
		<p>{ `Chart of ${ range.id }` }</p>
		{ footer }
	</>
) );
jest.mock( '../highlights', () => () => null );
jest.mock( '../modules', () => () => null );
jest.mock( '../record-widget-event', () => ( {
	__esModule: true,
	default: jest.fn(),
	recordWidgetEventThenFollow: jest.fn( () => jest.fn() ),
} ) );

const STORAGE_KEY = 'jetpack_stats_widget_date_range_123';

/**
 * Mounts the widget where the dashboard puts it, and waits for it to render.
 * @param {string} menu Markup for wp-admin's menu.
 */
async function renderWidget( menu = '' ) {
	document.body.innerHTML = `${ menu }<div id="dashboard_stats"></div>`;
	init();
	await screen.findByText( /^Chart of / );
}

describe( 'Stats widget', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		localStorage.clear();
	} );

	it( 'opens on the range last chosen on this site', async () => {
		localStorage.setItem( STORAGE_KEY, 'last_30_days' );
		await renderWidget();

		expect( screen.getByText( 'Chart of last_30_days' ) ).toBeInTheDocument();
	} );

	it( 'falls back to the default range for a value it no longer offers', async () => {
		localStorage.setItem( STORAGE_KEY, 'last_24_hours' );
		await renderWidget();

		expect( screen.getByText( 'Chart of last_7_days' ) ).toBeInTheDocument();
	} );

	it( 'still renders where site data is blocked', async () => {
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'SecurityError' );
		} );
		try {
			await renderWidget();
		} finally {
			Storage.prototype.getItem.mockRestore();
		}

		expect( screen.getByText( 'Chart of last_7_days' ) ).toBeInTheDocument();
	} );

	it( 'records and remembers a new range, but not picking the same one again', async () => {
		const user = userEvent.setup();
		await renderWidget();

		await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );
		await user.click( screen.getByRole( 'menuitemradio', { name: 'Last 7 days' } ) );
		expect( recordWidgetEvent ).not.toHaveBeenCalled();

		await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );
		await user.click( screen.getByRole( 'menuitemradio', { name: 'Last 90 days' } ) );

		expect( recordWidgetEvent ).toHaveBeenCalledWith( 'date_range_changed', {
			range: 'last_90_days',
		} );
		expect( localStorage.getItem( STORAGE_KEY ) ).toBe( 'last_90_days' );
		expect( screen.getByText( 'Chart of last_90_days' ) ).toBeInTheDocument();
	} );

	it( 'opens "More stats" on the days the chart shows', async () => {
		// Only the clock: findBy* still needs real timers to poll.
		jest.useFakeTimers( {
			now: new Date( '2026-10-06T12:00:00Z' ),
			doNotFake: [
				'setTimeout',
				'clearTimeout',
				'setInterval',
				'clearInterval',
				'setImmediate',
				'queueMicrotask',
				'nextTick',
			],
		} );
		localStorage.setItem( STORAGE_KEY, 'last_12_months' );
		// Each tracked link gets its own handler, so the click can be traced to this one.
		recordWidgetEventThenFollow.mockImplementation( () =>
			jest.fn( ( event ) => event.preventDefault() )
		);
		// The clock stays fixed until the end, since the widget works out its range on every render.
		try {
			await renderWidget();
			const link = screen.getByRole( 'link', { name: 'More stats' } );

			expect( link ).toHaveAttribute(
				'href',
				'https://example.com/stats/stats/month/123?chartStart=2025-11-01&chartEnd=2026-10-06'
			);

			const call = recordWidgetEventThenFollow.mock.calls.findIndex(
				( [ name ] ) => name === 'more_stats_clicked'
			);
			expect( recordWidgetEventThenFollow.mock.calls[ call ][ 1 ] ).toEqual( {
				range: 'last_12_months',
			} );
			await userEvent.setup().click( link );
			expect( recordWidgetEventThenFollow.mock.results[ call ].value ).toHaveBeenCalled();
		} finally {
			jest.useRealTimers();
			recordWidgetEventThenFollow.mockImplementation( () => jest.fn() );
		}
	} );

	it( 'sends "Explore more" to My Jetpack where the menu has it', async () => {
		await renderWidget(
			'<ul id="adminmenu"><li><a href="https://example.com/wp-admin/admin.php?page=my-jetpack">My Jetpack</a></li></ul>'
		);

		expect( screen.getByRole( 'link', { name: 'Explore more' } ) ).toHaveAttribute(
			'href',
			'https://example.com/wp-admin/admin.php?page=my-jetpack'
		);
		expect( recordWidgetEventThenFollow ).toHaveBeenCalledWith( 'explore_more_clicked', {
			destination: 'my_jetpack',
		} );
	} );

	it( 'sends "Explore more" to Stats without a Jetpack menu', async () => {
		await renderWidget();

		expect( screen.getByRole( 'link', { name: 'Explore more' } ) ).toHaveAttribute(
			'href',
			'https://example.com/stats/stats/day/123'
		);
		expect( recordWidgetEventThenFollow ).toHaveBeenCalledWith( 'explore_more_clicked', {
			destination: 'stats',
		} );
	} );
} );
