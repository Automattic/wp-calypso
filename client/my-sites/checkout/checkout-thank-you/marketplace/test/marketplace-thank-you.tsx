/**
 * @vitest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import MarketplaceThankYou from '../marketplace-thank-you';

const mockRestart = vi.fn();
const mockComplete = vi.fn();
const mockRetryAtomic = vi.fn();
const mockRetryPlugins = vi.fn();
const mockRetryThemes = vi.fn();
const mockSetShowProgressBar = vi.fn();
let mockState = {
	siteId: 1,
	transferStatus: transferStates.ACTIVE as string | null,
	isWpcomAtomic: false,
	isPageReady: false,
};
let mockWait = {
	isInitialized: true,
	hasTimedOut: false,
	getWaitedSeconds: () => 0,
	restart: mockRestart,
	complete: mockComplete,
};

vi.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: vi.fn() } ) );
vi.mock( '@automattic/components', () => ( {
	Button: ( { children, ...props }: React.ButtonHTMLAttributes< HTMLButtonElement > ) => (
		<button { ...props }>{ children }</button>
	),
} ) );
vi.mock( '@emotion/react', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => children,
	Global: () => null,
	css: () => null,
} ) );
vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( { useTranslate: () => ( text: string ) => text } )
);
vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/main', () => ( {
	default: ( { children }: { children: React.ReactNode } ) => <main>{ children }</main>,
} ) );
vi.mock( 'calypso/components/notice', () => ( {
	default: ( { text }: { text: React.ReactNode } ) => <div role="alert">{ text }</div>,
} ) );
vi.mock( 'calypso/components/thank-you-v2', () => ( { default: () => null } ) );
vi.mock( 'calypso/lib/analytics/page-view-tracker', () => ( { default: () => null } ) );
vi.mock( 'calypso/my-sites/marketplace/components/progressbar', () => ( { default: () => null } ) );
vi.mock( 'calypso/my-sites/marketplace/theme', () => ( ( m ) => ( { ...m, default: m } ) )( {} ) );
vi.mock( 'calypso/state', () => ( {
	useDispatch: () => vi.fn(),
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );
vi.mock( 'calypso/state/admin-menu/actions', () => ( { requestAdminMenu: vi.fn() } ) );
vi.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: ( state: typeof mockState ) => state.transferStatus,
} ) );
vi.mock( 'calypso/state/plugins/installed/selectors', () => ( { isRequesting: () => false } ) );
vi.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: () => false,
} ) );
vi.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => ( {
	__esModule: true,
	default: ( state: typeof mockState ) => state.isWpcomAtomic,
} ) );
vi.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteAdminUrl: () => null,
	isJetpackSite: () => false,
} ) );
vi.mock( 'calypso/state/themes/actions', () => ( { setThemePreviewOptions: vi.fn() } ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: typeof mockState ) => state.siteId,
} ) );
vi.mock( '../marketplace-go-back-section', () => ( { MarketplaceGoBackSection: () => null } ) );
vi.mock( '../use-page-texts', () => ( { usePageTexts: () => [ '', '' ] } ) );
vi.mock( '../use-thank-you-footer', () => ( { useThankYouFoooter: () => null } ) );
vi.mock( '../use-thank-you-steps', () => ( {
	useThankYouSteps: () => ( { steps: [], additionalSteps: [] } ),
} ) );
vi.mock( '../use-thank-you-deadline', () => ( {
	useThankYouDeadline: () => mockWait,
} ) );
vi.mock( '../use-plugins-thank-you-data', () => ( {
	__esModule: true,
	default: () => ( {
		pluginsSection: [],
		allPluginsFetched: mockState.isPageReady,
		allPluginsActivated: mockState.isPageReady,
		pluginTitle: '',
		pluginSubtitle: '',
		pluginsProgressbarSteps: [],
		isAtomicNeeded: true,
		thankYouHeaderAction: null,
		isLoaded: true,
		retry: mockRetryPlugins,
	} ),
} ) );
vi.mock( '../use-atomic-transfer', () => ( {
	useAtomicTransfer: () => ( {
		isAtomicTransferCheckComplete: mockState.isPageReady,
		currentStep: 0,
		showProgressBar: false,
		setShowProgressBar: mockSetShowProgressBar,
		isRetryingTransferStatus: false,
		trustedTransferStatus: mockState.transferStatus,
		retry: mockRetryAtomic,
	} ),
} ) );
vi.mock( '../use-themes-thank-you-data', () => ( {
	useThemesThankYouData: () => ( {
		firstTheme: null,
		themesSection: [],
		allThemesFetched: true,
		themeTitle: '',
		themeSubtitle: '',
		themesProgressbarSteps: [],
		isAtomicNeeded: false,
		thankYouHeaderAction: null,
		isLoaded: true,
		retry: mockRetryThemes,
	} ),
} ) );

const renderPage = () =>
	render(
		<MarketplaceThankYou
			pluginSlugs={ [ 'sensei-pro' ] }
			themeSlugs={ [] }
			isOnboardingFlow={ false }
			styleVariationSlug={ null }
			continueWithPluginBundle={ null }
		/>
	);

describe( 'MarketplaceThankYou errors', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockState = {
			siteId: 1,
			transferStatus: transferStates.ACTIVE,
			isWpcomAtomic: false,
			isPageReady: false,
		};
		mockWait = {
			isInitialized: true,
			hasTimedOut: false,
			getWaitedSeconds: () => 0,
			restart: mockRestart,
			complete: mockComplete,
		};
	} );

	it( 'renders and reports a transfer failure', () => {
		mockState.transferStatus = transferStates.FAILURE;
		renderPage();

		expect(
			screen.getByText( "Sorry, we couldn't process your transfer. Please try again later." )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_marketplace_thank_you_wait_ended',
			expect.objectContaining( {
				error: 'transfer-failed',
				transfer_status: transferStates.FAILURE,
				plugin_slugs: 'sensei-pro',
			} )
		);
	} );

	it( 'renders a timeout and lets the customer retry', async () => {
		mockWait = { ...mockWait, hasTimedOut: true, getWaitedSeconds: () => 300 };
		renderPage();

		expect(
			screen.getByText( 'Setting up your site is taking longer than expected.' )
		).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Check again' } ) );

		expect( mockRestart ).toHaveBeenCalledTimes( 1 );
		expect( mockRetryAtomic ).toHaveBeenCalledTimes( 1 );
		expect( mockRetryPlugins ).toHaveBeenCalledTimes( 1 );
		expect( mockRetryThemes ).toHaveBeenCalledTimes( 1 );
		expect( mockSetShowProgressBar ).toHaveBeenCalledWith( true );
	} );
} );

describe( 'MarketplaceThankYou admin menu refresh', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockState = {
			siteId: 1,
			transferStatus: null,
			isWpcomAtomic: false,
			isPageReady: true,
		};
		mockWait = {
			isInitialized: true,
			hasTimedOut: false,
			getWaitedSeconds: () => 0,
			restart: mockRestart,
			complete: mockComplete,
		};
	} );

	it( 'refreshes the admin menu without a transfer status when the site is already Atomic', () => {
		mockState.isWpcomAtomic = true;
		renderPage();

		expect( requestAdminMenu ).toHaveBeenCalledWith( 1 );
	} );

	it( 'refreshes the admin menu once the transfer has completed', () => {
		mockState.transferStatus = transferStates.COMPLETE;
		renderPage();

		expect( requestAdminMenu ).toHaveBeenCalledWith( 1 );
	} );

	it( 'does not refresh the admin menu without a transfer status when the site is not Atomic', () => {
		renderPage();

		expect( requestAdminMenu ).not.toHaveBeenCalled();
	} );
} );
