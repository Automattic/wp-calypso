/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import MarketplaceThankYou from '../marketplace-thank-you';

const mockRestart = jest.fn();
const mockComplete = jest.fn();
const mockRetryAtomic = jest.fn();
const mockRetryPlugins = jest.fn();
const mockRetryThemes = jest.fn();
const mockSetShowProgressBar = jest.fn();
let mockState = {
	siteId: 1,
	transferStatus: transferStates.ACTIVE as string | null,
};
let mockWait = {
	isInitialized: true,
	hasTimedOut: false,
	getWaitedSeconds: () => 0,
	restart: mockRestart,
	complete: mockComplete,
};

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/components', () => ( {
	Button: ( { children, ...props }: React.ButtonHTMLAttributes< HTMLButtonElement > ) => (
		<button { ...props }>{ children }</button>
	),
} ) );
jest.mock( '@emotion/react', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => children,
	Global: () => null,
	css: () => null,
} ) );
jest.mock( 'i18n-calypso', () => ( { useTranslate: () => ( text: string ) => text } ) );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/main', () => ( { children }: { children: React.ReactNode } ) => (
	<main>{ children }</main>
) );
jest.mock( 'calypso/components/notice', () => ( { text }: { text: React.ReactNode } ) => (
	<div role="alert">{ text }</div>
) );
jest.mock( 'calypso/components/thank-you-v2', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/my-sites/marketplace/components/progressbar', () => () => null );
jest.mock( 'calypso/my-sites/marketplace/theme', () => ( {} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );
jest.mock( 'calypso/state/admin-menu/actions', () => ( { requestAdminMenu: jest.fn() } ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: ( state: typeof mockState ) => state.transferStatus,
} ) );
jest.mock( 'calypso/state/plugins/installed/selectors', () => ( { isRequesting: () => false } ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: () => false,
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteAdminUrl: () => null,
	isJetpackSite: () => false,
} ) );
jest.mock( 'calypso/state/themes/actions', () => ( { setThemePreviewOptions: jest.fn() } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: typeof mockState ) => state.siteId,
} ) );
jest.mock( '../marketplace-go-back-section', () => ( { MarketplaceGoBackSection: () => null } ) );
jest.mock( '../use-page-texts', () => ( { usePageTexts: () => [ '', '' ] } ) );
jest.mock( '../use-thank-you-footer', () => ( { useThankYouFoooter: () => null } ) );
jest.mock( '../use-thank-you-steps', () => ( {
	useThankYouSteps: () => ( { steps: [], additionalSteps: [] } ),
} ) );
jest.mock( '../use-thank-you-deadline', () => ( {
	useThankYouDeadline: () => mockWait,
} ) );
jest.mock( '../use-plugins-thank-you-data', () => ( {
	__esModule: true,
	default: () => ( {
		pluginsSection: [],
		allPluginsFetched: false,
		allPluginsActivated: false,
		pluginTitle: '',
		pluginSubtitle: '',
		pluginsProgressbarSteps: [],
		isAtomicNeeded: true,
		thankYouHeaderAction: null,
		isLoaded: true,
		retry: mockRetryPlugins,
	} ),
} ) );
jest.mock( '../use-atomic-transfer', () => ( {
	useAtomicTransfer: () => ( {
		isAtomicTransferCheckComplete: false,
		currentStep: 0,
		showProgressBar: false,
		setShowProgressBar: mockSetShowProgressBar,
		isRetryingTransferStatus: false,
		trustedTransferStatus: mockState.transferStatus,
		retry: mockRetryAtomic,
	} ),
} ) );
jest.mock( '../use-themes-thank-you-data', () => ( {
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
		jest.clearAllMocks();
		mockState = { siteId: 1, transferStatus: transferStates.ACTIVE };
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
