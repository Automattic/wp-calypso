/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import FreeSiteUpgradeNotice from '../free-site-upgrade-notice';

vi.mock( 'calypso/state', () => ( {
	useSelector: () => false,
} ) );

vi.mock( 'react-redux', () => ( {
	useDispatch: () => vi.fn(),
} ) );

vi.mock( '@wordpress/data', () => ( {
	combineReducers: ( reducers: unknown ) => reducers,
	createReduxStore: vi.fn(),
	createRegistrySelector: ( selector: unknown ) => selector,
	createSelector: ( selector: unknown ) => selector,
	register: vi.fn(),
	select: vi.fn(),
	dispatch: vi.fn(),
	subscribe: vi.fn(),
	useSelect: vi.fn(),
	useDispatch: () => ( { setShowHelpCenter: vi.fn(), setShowSupportDoc: vi.fn() } ),
} ) );

vi.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'help-center' },
} ) );

vi.mock( '@automattic/calypso-products', () => ( {
	PLAN_PREMIUM: 'value_bundle',
	getPlan: () => ( { getTitle: () => 'Explorer' } ),
} ) );

vi.mock( 'calypso/state/stats/paid-stats-upsell/actions', () => ( {
	toggleUpsellModal: vi.fn(),
} ) );

vi.mock( 'calypso/my-sites/stats/utils', () => ( {
	trackStatsAnalyticsEvent: vi.fn(),
} ) );

vi.mock( 'calypso/state/selectors/is-site-wpcom', () => ( {
	__esModule: true,
	default: () => false,
} ) );

vi.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: () => undefined,
	isEnabled: () => false,
} ) );

vi.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url: string ) => url,
} ) );

const mockUseNoticeVisibilityMutation = vi.fn< ( ...args: unknown[] ) => { mutateAsync: Mock } >(
	() => ( {
		mutateAsync: vi.fn(),
	} )
);
vi.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockUseNoticeVisibilityMutation( ...args ),
} ) );

vi.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: vi.fn() } ) );

const renderNotice = ( hasFreeStats = false ) =>
	render(
		<FreeSiteUpgradeNotice siteId={ 123 } isOdysseyStats={ false } hasFreeStats={ hasFreeStats } />
	);

describe( 'FreeSiteUpgradeNotice', () => {
	it( 'renders a dismissible feature-led upgrade prompt', () => {
		renderNotice();

		expect( screen.getByRole( 'button', { name: 'close' } ) ).toBeVisible();
		expect( screen.getByText( 'Unlock more Stats with a paid plan' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Jetpack Stats is free to keep using. A paid plan adds UTM stats, device stats, and region and city stats.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Learn more/ } ) ).toHaveAttribute(
			'href',
			'https://jetpack.com/support/jetpack-stats/free-or-paid/#what-a-paid-plan-adds'
		);
	} );

	it( 'asks free-Stats owners to get the most out of Stats instead', () => {
		renderNotice( true );

		expect( screen.getByText( 'Want to get the most out of Jetpack Stats?' ) ).toBeVisible();
	} );

	it( 'postpones dismissals of its own notice id off any practical timer', () => {
		renderNotice();

		expect( mockUseNoticeVisibilityMutation ).toHaveBeenCalledWith(
			123,
			'free_site_upgrade',
			'postponed',
			3650 * 24 * 3600
		);
	} );
} );
