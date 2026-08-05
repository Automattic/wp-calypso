/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import FreeSiteUpgradeNotice from '../free-site-upgrade-notice';

jest.mock( 'calypso/state', () => ( {
	useSelector: () => false,
} ) );

jest.mock( 'react-redux', () => ( {
	useDispatch: () => jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	combineReducers: ( reducers: unknown ) => reducers,
	createReduxStore: jest.fn(),
	createRegistrySelector: ( selector: unknown ) => selector,
	createSelector: ( selector: unknown ) => selector,
	register: jest.fn(),
	select: jest.fn(),
	dispatch: jest.fn(),
	subscribe: jest.fn(),
	useSelect: jest.fn(),
	useDispatch: () => ( { setShowHelpCenter: jest.fn(), setShowSupportDoc: jest.fn() } ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'help-center' },
	Purchases: {
		utils: { createPurchaseObject: jest.fn(), createPurchasesArray: jest.fn() },
	},
} ) );

jest.mock( '@automattic/calypso-products', () => ( {
	PLAN_PREMIUM: 'value_bundle',
	getPlan: () => ( { getTitle: () => 'Explorer' } ),
} ) );

jest.mock( 'calypso/state/stats/paid-stats-upsell/actions', () => ( {
	toggleUpsellModal: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/stats/utils', () => ( {
	trackStatsAnalyticsEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/selectors/is-site-wpcom', () => ( {
	__esModule: true,
	default: () => false,
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: () => undefined,
	isEnabled: () => false,
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url: string ) => url,
	useHasEnTranslation: () => () => true,
} ) );

const mockUseNoticeVisibilityMutation = jest.fn< { mutateAsync: jest.Mock }, unknown[] >( () => ( {
	mutateAsync: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockUseNoticeVisibilityMutation( ...args ),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );

const renderNotice = ( hasFreeStats = false ) =>
	render(
		<FreeSiteUpgradeNotice siteId={ 123 } isOdysseyStats={ false } hasFreeStats={ hasFreeStats } />
	);

describe( 'FreeSiteUpgradeNotice', () => {
	it( 'renders a dismissible feature-led upgrade prompt', () => {
		renderNotice();

		expect( screen.getByRole( 'button', { name: 'close' } ) ).toBeVisible();
		expect( screen.getByText( 'Unlock premium features' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Upgrade to unlock UTM tracking, device stats, and region and city locations, and get priority support.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Upgrade my Stats' } ) ).toBeVisible();
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
			36500 * 24 * 3600
		);
	} );
} );
