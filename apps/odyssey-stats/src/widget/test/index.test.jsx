/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { init } from '..';
import recordWidgetEvent, { recordWidgetEventThenFollow } from '../record-widget-event';

vi.mock( '../../lib/config-api', () => ( {
	__esModule: true,
	default: ( key ) => ( { blog_id: 123, gmt_offset: 0, i18n_locale_slug: 'en' } )[ key ],
	optionalConfig: () => undefined,
} ) );
vi.mock( '../../lib/set-locale', () => ( { default: () => Promise.resolve() } ) );
vi.mock( '../../lib/load-wp-components-style', () => ( {
	loadWpComponentsStyleForWidget: () => Promise.resolve(),
} ) );
vi.mock( '../../lib/selectors/get-site-stats-base-url', () => ( {
	default: () => 'https://example.com/stats',
} ) );
vi.mock( '../../lib/selectors/get-site-admin-url', () => ( {
	default: () => 'https://example.com/wp-admin/',
} ) );
vi.mock( 'calypso/my-sites/stats/hooks/use-wp-admin-theme', () => ( { default: () => null } ) );
const mockGates = vi.hoisted( () => ( { locked: [] } ) );
vi.mock( '../use-stats-gates', async ( importOriginal ) => ( {
	...( await importOriginal() ),
	default: () => ( {
		isLoading: false,
		isGated: ( statType ) => mockGates.locked.includes( statType ),
	} ),
} ) );
const mockStatsLink = vi.fn( ( url ) => url );
vi.mock( '../use-stats-link', () => ( { default: () => mockStatsLink } ) );
vi.mock( '../mini-chart', () => ( {
	default: ( { range } ) => <p>{ `Chart of ${ range.id }` }</p>,
} ) );
vi.mock( '../highlights', () => ( { default: () => null } ) );
vi.mock( '../modules', () => ( { default: () => null } ) );
vi.mock( '../record-widget-event', () => ( {
	__esModule: true,
	default: vi.fn(),
	recordWidgetEventThenFollow: vi.fn( () => vi.fn() ),
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
		vi.clearAllMocks();
		localStorage.clear();
		mockGates.locked = [];
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
		vi.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
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
		expect( mockStatsLink ).toHaveBeenCalledWith(
			'https://example.com/stats/stats/day/123',
			'/?section=traffic'
		);
		expect( recordWidgetEventThenFollow ).toHaveBeenCalledWith( 'explore_more_clicked', {
			destination: 'stats',
		} );
	} );

	describe( 'on a plan that locks longer ranges', () => {
		beforeEach( () => {
			mockGates.locked = [
				'StatsDateControl/last_30_days',
				'StatsModuleSummaryLinks/quarter',
				'StatsDateControl/last_12_months',
			];
		} );

		it( 'shows the last 7 days in place of a remembered range the plan locks', async () => {
			localStorage.setItem( STORAGE_KEY, 'last_90_days' );
			await renderWidget();

			expect( screen.getByText( 'Chart of last_7_days' ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { name: 'Date range: Last 7 days' } )
			).toBeInTheDocument();
			// Kept, for when the site has the range again.
			expect( localStorage.getItem( STORAGE_KEY ) ).toBe( 'last_90_days' );
		} );

		it( 'locks them in the menu, upselling on Stats for a site it does not know', async () => {
			const user = userEvent.setup();
			await renderWidget();

			await user.click( screen.getByRole( 'button', { name: 'Date range: Last 7 days' } ) );

			expect( screen.getByRole( 'menuitemradio', { name: 'Last 30 days' } ) ).toBeDisabled();
			expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toHaveAttribute(
				'href',
				'https://example.com/stats/stats/day/123'
			);
		} );
	} );
} );
