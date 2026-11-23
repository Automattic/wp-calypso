/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { useQuery as useDataQuery } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { SITE_SELECTED_REF, WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { usePlanCartItem } from '../../../../../hooks/use-plan-cart-item';
import { useSiteData } from '../../../../../hooks/use-site-data';
import { useAiToolExperiment } from '../ai-tool-experiment';
import SetupYourSiteAIStep from '../index';

let mockQueryParams = new URLSearchParams();
let mockUntranslatedTexts: string[] = [];
let mockAiToolExperiment = { isLoading: false, isTreatment: false };
let mockIsLoadingSite = false;

jest.mock( '@automattic/components', () => ( {
	BigSkyLogo: { CentralLogo: () => null },
	SummaryButton: ( {
		title,
		decoration,
		onClick,
		disabled,
	}: {
		title: string;
		decoration?: React.ReactNode;
		onClick: () => void;
		disabled?: boolean;
	} ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ decoration }
			{ title }
		</button>
	),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useQuery: jest.fn(),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		CenteredColumnLayout: ( { children }: { children: React.ReactNode } ) => (
			<div>{ children }</div>
		),
		TopBar: () => null,
		Heading: () => null,
	},
} ) );

jest.mock( 'i18n-calypso', () => ( {
	__esModule: true,
	default: {
		fixMe: ( { text, oldCopy }: { text: string; oldCopy: string } ) =>
			mockUntranslatedTexts.includes( text ) ? oldCopy : text,
	},
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useHasEnTranslation: () => ( text: string ) => ! mockUntranslatedTexts.includes( text ),
} ) );

jest.mock( '../ai-tool-experiment', () => ( {
	useAiToolExperiment: jest.fn( ( isEligible: boolean ) =>
		isEligible ? mockAiToolExperiment : { isLoading: false, isTreatment: false }
	),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteSlug: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/build-wow-plans', () => {
	const isCommerce = ( slug?: string ) => /^ecommerce-(trial-)?bundle/.test( slug ?? '' );
	return {
		planSupportsBuildWow: ( slug?: string ) =>
			!! slug && slug !== 'pro-plan' && ! isCommerce( slug ),
		planBuildsStoreOnBuildWow: isCommerce,
	};
} );

jest.mock( '../../../../../hooks/use-plan-cart-item', () => ( {
	usePlanCartItem: jest.fn(),
} ) );

jest.mock( '../../../../../hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
} ) );

jest.mock( '../../../../../hooks/use-site', () => ( {
	useSiteQuery: () => ( { isLoading: mockIsLoadingSite } ),
} ) );

jest.mock( '../../../../../hooks/use-site-data', () => ( {
	useSiteData: jest.fn(),
} ) );

jest.mock( '../../../hooks/use-purchase-plan-notification', () => ( {
	usePurchasePlanNotification: jest.fn(),
} ) );

describe( 'SetupYourSiteAIStep', () => {
	const mockUseSiteData = useSiteData as jest.Mock;
	const isEnabled = jest.spyOn( config, 'isEnabled' );
	const navigation = { submit: jest.fn() };

	const renderStep = () =>
		render(
			<SetupYourSiteAIStep
				navigation={ navigation }
				stepName="setup-your-site-ai"
				flow="onboarding"
			/>
		);

	const getButtonNames = () =>
		screen
			.getAllByRole( 'button' )
			.map( ( button ) => button.getAttribute( 'aria-label' ) || button.textContent );

	const setSitePlan = ( productSlug: string ) =>
		mockUseSiteData.mockReturnValue( {
			site: { plan: { product_slug: productSlug } },
			siteSlug: 'example.wordpress.com',
			siteId: 123,
		} );

	const setAutomattician = ( isAutomattician: boolean ) =>
		( useDataQuery as jest.Mock ).mockImplementation( ( { enabled } ) => ( {
			data: enabled ? isAutomattician : undefined,
		} ) );

	const setPlanCartItem = ( productSlug: string | null ) =>
		( usePlanCartItem as jest.Mock ).mockReturnValue(
			productSlug ? { product_slug: productSlug } : null
		);

	const tracksCallsFor = ( eventName: string ) =>
		( recordTracksEvent as jest.Mock ).mock.calls.filter( ( [ name ] ) => name === eventName );

	const viewCalls = () => tracksCallsFor( 'calypso_onboarding_setup_your_site_with_ai_view' );

	const clickCustomDesign = () =>
		fireEvent.click( screen.getByRole( 'button', { name: 'Create a custom design' } ) );

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryParams = new URLSearchParams();
		mockUntranslatedTexts = [];
		mockAiToolExperiment = { isLoading: false, isTreatment: false };
		mockIsLoadingSite = false;
		isEnabled.mockImplementation(
			( flag: string ) =>
				flag !== 'site-spec/build-wow-blocks-first' && flag !== 'onboarding/setup-your-site-ai-tool'
		);
		setAutomattician( true );
		setSitePlan( 'business-bundle' );
		setPlanCartItem( null );
		( getSignupCompleteSlug as jest.Mock ).mockReturnValue( 'example.wordpress.com' );
	} );

	describe( 'card order', () => {
		it( 'renders the custom design card before the template card by default', () => {
			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'keeps the AI prompt card before the template card for the Woo hosting solutions ref', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Build with AI', 'Start with a pre-made design' ] );
		} );
	} );

	describe( 'card selection', () => {
		it( 'submits the blank-site choice from the template card', () => {
			renderStep();

			fireEvent.click( screen.getByRole( 'button', { name: 'Start with a pre-made design' } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'blank-site' }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'blank-site',
				siteSlug: 'example.wordpress.com',
			} );
		} );

		it.each( [
			{
				selection: 'blank-site',
				choose: () =>
					fireEvent.click( screen.getByRole( 'button', { name: 'Start with a pre-made design' } ) ),
				properties: { selection: 'blank-site' },
			},
			{
				selection: 'generate-theme',
				choose: () => clickCustomDesign(),
				properties: { selection: 'generate-theme', graph: 'dsl' },
			},
			{
				selection: 'build-with-ai',
				plan: 'pro-plan',
				choose: () => clickCustomDesign(),
				properties: { selection: 'build-with-ai', has_prompt: false },
			},
		] )(
			'tags the $selection selection with the ref the step was reached with',
			( { plan, choose, properties } ) => {
				mockQueryParams = new URLSearchParams( { ref: SITE_SELECTED_REF } );
				if ( plan ) {
					setSitePlan( plan );
				}

				renderStep();
				choose();

				expect( recordTracksEvent ).toHaveBeenCalledWith(
					'calypso_onboarding_setup_your_site_with_ai_selection',
					{ ...properties, ref: SITE_SELECTED_REF }
				);
			}
		);

		it( 'submits the generate-theme choice from the custom design card on an Atomic-capable plan', () => {
			renderStep();

			clickCustomDesign();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'generate-theme', graph: 'dsl' }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'generate-theme',
				siteSlug: 'example.wordpress.com',
				siteId: 123,
				graph: 'dsl',
			} );
		} );

		it( 'submits the build-with-ai choice from the custom design card on a plan without Atomic', () => {
			setSitePlan( 'pro-plan' );

			renderStep();

			clickCustomDesign();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'build-with-ai', has_prompt: false }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'build-with-ai',
				siteSlug: 'example.wordpress.com',
				siteId: 123,
			} );
		} );

		it.each( [ 'ecommerce-bundle', 'ecommerce-trial-bundle-monthly' ] )(
			'submits the generate-theme choice from the custom design card on %s',
			( planSlug ) => {
				setSitePlan( planSlug );

				renderStep();

				clickCustomDesign();

				expect( navigation.submit ).toHaveBeenCalledWith( {
					setupChoice: 'generate-theme',
					siteSlug: 'example.wordpress.com',
					siteId: 123,
					graph: 'dsl',
					buildsStore: true,
				} );
			}
		);

		it( 'keeps the Woo hosting solutions form on build-with-ai', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			fireEvent.change( screen.getByPlaceholderText( 'Take bookings for a hair salon…' ), {
				target: { value: 'a hair salon' },
			} );
			fireEvent.click( screen.getByRole( 'button', { name: 'Build with AI' } ) );

			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'build-with-ai',
				siteSlug: 'example.wordpress.com',
				siteId: 123,
				prompt: 'a hair salon',
			} );
		} );

		it( 'prefers the plan just bought over a stale site plan', () => {
			setSitePlan( 'pro-plan' );
			setPlanCartItem( 'value_bundle' );

			renderStep();

			clickCustomDesign();

			expect( navigation.submit ).toHaveBeenCalledWith(
				expect.objectContaining( { setupChoice: 'generate-theme' } )
			);
		} );

		it( 'ignores a cart item left over from a checkout for another site', () => {
			( getSignupCompleteSlug as jest.Mock ).mockReturnValue( 'other.wordpress.com' );
			setSitePlan( 'pro-plan' );
			setPlanCartItem( 'business-bundle' );

			renderStep();

			clickCustomDesign();

			expect( navigation.submit ).toHaveBeenCalledWith(
				expect.objectContaining( { setupChoice: 'build-with-ai' } )
			);
		} );

		it( 're-enables the controls when the page is restored from bfcache', () => {
			renderStep();

			clickCustomDesign();
			expect(
				screen.getByRole( 'button', { name: 'Start with a pre-made design' } )
			).toBeDisabled();

			const pageshow = new Event( 'pageshow' ) as PageTransitionEvent;
			Object.defineProperty( pageshow, 'persisted', { value: true } );
			fireEvent( window, pageshow );

			expect(
				screen.getByRole( 'button', { name: 'Start with a pre-made design' } )
			).toBeEnabled();
		} );

		it( 'submits a choice only once per visit and disables the controls', () => {
			renderStep();

			clickCustomDesign();
			clickCustomDesign();
			fireEvent.click( screen.getByRole( 'button', { name: 'Start with a pre-made design' } ) );

			expect( navigation.submit ).toHaveBeenCalledTimes( 1 );
			expect(
				screen.getByRole( 'button', { name: 'Start with a pre-made design' } )
			).toBeDisabled();
			expect( screen.getByRole( 'button', { name: 'Create a custom design' } ) ).toBeDisabled();
		} );
	} );

	describe( 'with the build-wow blocks-first feature enabled', () => {
		beforeEach( () => {
			isEnabled.mockReturnValue( true );
		} );

		it( 'renders the blocks-first card last for an Automattician', () => {
			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
				'Create a custom design (blocks-first)',
			] );
		} );

		it( 'submits the generate-theme choice on the blocks-first graph', () => {
			renderStep();

			fireEvent.click(
				screen.getByRole( 'button', { name: 'Create a custom design (blocks-first)' } )
			);

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'generate-theme', graph: 'blocks-first' }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'generate-theme',
				siteSlug: 'example.wordpress.com',
				siteId: 123,
				graph: 'blocks-first',
			} );
		} );

		it( 'hides the blocks-first card from a non-Automattician', () => {
			setAutomattician( false );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'hides the blocks-first card on a plan that cannot take build-wow', () => {
			setSitePlan( 'pro-plan' );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'hides the blocks-first card for the Woo hosting solutions ref', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Build with AI', 'Start with a pre-made design' ] );
		} );
	} );

	describe( 'with the AI tool feature enabled', () => {
		const setSiteSetupSite = ( options: Record< string, unknown > = {} ) =>
			mockUseSiteData.mockReturnValue( {
				site: {
					plan: { product_slug: 'business-bundle' },
					options: {
						admin_url: 'https://example.wordpress.com/wp-admin/',
						wpcom_ai_launchpad_enabled: true,
						...options,
					},
				},
				siteSlug: 'example.wordpress.com',
				siteId: 123,
			} );

		const clickAiTool = () =>
			fireEvent.click( screen.getByRole( 'button', { name: 'Build with AI' } ) );

		beforeEach( () => {
			isEnabled.mockImplementation(
				( flag: string ) => flag !== 'site-spec/build-wow-blocks-first'
			);
			setSiteSetupSite();
			mockAiToolExperiment = { isLoading: false, isTreatment: true };
		} );

		it( 'assigns the experiment when the step renders', () => {
			renderStep();

			expect( useAiToolExperiment ).toHaveBeenLastCalledWith( true );
		} );

		it( 'shows only the two original cards to the control group', () => {
			mockAiToolExperiment = { isLoading: false, isTreatment: false };

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'holds back every card until the assignment is back', () => {
			mockAiToolExperiment = { isLoading: true, isTreatment: false };

			renderStep();

			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		} );

		it( 'holds back every card while the site loads for the treatment group', () => {
			mockUseSiteData.mockReturnValue( {
				site: null,
				siteSlug: 'example.wordpress.com',
				siteId: 0,
			} );
			mockIsLoadingSite = true;

			renderStep();

			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		} );

		it( 'does not hold the control group back while the site loads', () => {
			mockAiToolExperiment = { isLoading: false, isTreatment: false };
			mockUseSiteData.mockReturnValue( {
				site: null,
				siteSlug: 'example.wordpress.com',
				siteId: 0,
			} );
			mockIsLoadingSite = true;

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'shows the cards to the treatment group when the site fails to load', () => {
			mockUseSiteData.mockReturnValue( {
				site: null,
				siteSlug: 'example.wordpress.com',
				siteId: 0,
			} );
			mockIsLoadingSite = false;

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'does not assign the Woo hosting solutions layout', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( useAiToolExperiment ).toHaveBeenLastCalledWith( false );
		} );

		it( 'renders the AI tool card after the template card on a Site Setup site', () => {
			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
				'Build with AI',
			] );
		} );

		it( 'places the AI tool card before the blocks-first card', () => {
			isEnabled.mockReturnValue( true );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
				'Build with AI',
				'Create a custom design (blocks-first)',
			] );
		} );

		it( 'shows the AI tool card once a failed site load recovers', () => {
			mockUseSiteData.mockReturnValue( {
				site: null,
				siteSlug: 'example.wordpress.com',
				siteId: 0,
			} );
			const { rerender } = renderStep();
			expect( screen.queryByRole( 'button', { name: 'Build with AI' } ) ).not.toBeInTheDocument();

			setSiteSetupSite();
			rerender(
				<SetupYourSiteAIStep
					navigation={ navigation }
					stepName="setup-your-site-ai"
					flow="onboarding"
				/>
			);

			expect( screen.getByRole( 'button', { name: 'Build with AI' } ) ).toBeVisible();
		} );

		it( 'submits the ai-tool choice once and tracks it once', () => {
			renderStep();

			clickAiTool();
			clickAiTool();

			expect( tracksCallsFor( 'calypso_onboarding_setup_your_site_with_ai_selection' ) ).toEqual( [
				[ 'calypso_onboarding_setup_your_site_with_ai_selection', { selection: 'ai-tool' } ],
			] );
			expect( navigation.submit ).toHaveBeenCalledTimes( 1 );
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'ai-tool',
				siteSlug: 'example.wordpress.com',
			} );
		} );

		it( 'records the view once, with the card shown, for the treatment group', () => {
			const { rerender } = renderStep();
			mockUntranslatedTexts = [ 'Connect ChatGPT or Claude and build your site by chatting.' ];
			rerender(
				<SetupYourSiteAIStep
					navigation={ navigation }
					stepName="setup-your-site-ai"
					flow="onboarding"
				/>
			);

			expect( viewCalls() ).toEqual( [
				[ 'calypso_onboarding_setup_your_site_with_ai_view', { ai_tool_shown: true } ],
			] );
		} );

		it( 'records the view once the site loads for the treatment group', () => {
			mockUseSiteData.mockReturnValue( {
				site: null,
				siteSlug: 'example.wordpress.com',
				siteId: 0,
			} );
			mockIsLoadingSite = true;
			const { rerender } = renderStep();
			expect( viewCalls() ).toEqual( [] );

			setSiteSetupSite();
			mockIsLoadingSite = false;
			rerender(
				<SetupYourSiteAIStep
					navigation={ navigation }
					stepName="setup-your-site-ai"
					flow="onboarding"
				/>
			);

			expect( viewCalls() ).toEqual( [
				[ 'calypso_onboarding_setup_your_site_with_ai_view', { ai_tool_shown: true } ],
			] );
		} );

		it( 'records the view without the card for the control group', () => {
			mockAiToolExperiment = { isLoading: false, isTreatment: false };

			renderStep();

			expect( viewCalls() ).toEqual( [
				[ 'calypso_onboarding_setup_your_site_with_ai_view', { ai_tool_shown: false } ],
			] );
		} );

		it( 'tags the view with the ref the step was reached with', () => {
			mockQueryParams = new URLSearchParams( { ref: SITE_SELECTED_REF } );

			renderStep();

			expect( viewCalls() ).toEqual( [
				[
					'calypso_onboarding_setup_your_site_with_ai_view',
					{ ai_tool_shown: true, ref: SITE_SELECTED_REF },
				],
			] );
		} );

		it( 'records no view while the cards are held', () => {
			mockAiToolExperiment = { isLoading: true, isTreatment: false };

			renderStep();

			expect( viewCalls() ).toEqual( [] );
		} );

		it( 'records no view for the Woo hosting solutions layout', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( viewCalls() ).toEqual( [] );
		} );

		it( 'tags the ai-tool selection with the ref the step was reached with', () => {
			mockQueryParams = new URLSearchParams( { ref: SITE_SELECTED_REF } );

			renderStep();
			clickAiTool();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'ai-tool', ref: SITE_SELECTED_REF }
			);
		} );

		it( 'ignores the other cards once the AI tool card is chosen', () => {
			renderStep();

			clickAiTool();
			clickCustomDesign();
			fireEvent.click( screen.getByRole( 'button', { name: 'Start with a pre-made design' } ) );

			expect( navigation.submit ).toHaveBeenCalledTimes( 1 );
			expect( screen.getByRole( 'button', { name: 'Build with AI' } ) ).toBeDisabled();
			expect( screen.getByRole( 'button', { name: 'Create a custom design' } ) ).toBeDisabled();
		} );

		it( 're-enables the AI tool card when the page is restored from bfcache', () => {
			renderStep();

			clickAiTool();
			expect( screen.getByRole( 'button', { name: 'Build with AI' } ) ).toBeDisabled();

			const pageshow = new Event( 'pageshow' ) as PageTransitionEvent;
			Object.defineProperty( pageshow, 'persisted', { value: true } );
			fireEvent( window, pageshow );

			expect( screen.getByRole( 'button', { name: 'Build with AI' } ) ).toBeEnabled();
		} );

		it.each( [
			[ 'without the AI Launchpad', { wpcom_ai_launchpad_enabled: false } ],
			[ 'with no guidance', { wpcom_ai_launchpad_no_guidance: true } ],
			[ 'with a skipped AI Launchpad', { wpcom_ai_launchpad_dismissed: true } ],
			[ 'with a completed AI Launchpad', { wpcom_ai_launchpad_completed: true } ],
		] )( 'hides the AI tool card on a site %s', ( _, options ) => {
			setSiteSetupSite( options );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'hides the AI tool card for the Woo hosting solutions ref', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Build with AI', 'Start with a pre-made design' ] );
		} );

		it( 'hides the AI tool card while the custom design card still reads Build with AI', () => {
			mockUntranslatedTexts = [ 'Create a custom design' ];

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Build with AI', 'Start with a pre-made design' ] );
		} );

		it( 'hides the AI tool card while its description is untranslated', () => {
			mockUntranslatedTexts = [ 'Connect ChatGPT or Claude and build your site by chatting.' ];

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );

		it( 'falls back to an icon when the ChatGPT logo fails to load', () => {
			renderStep();
			const card = screen.getByRole( 'button', { name: 'Build with AI' } );
			const logo = card.querySelector( 'img' );
			expect( logo ).toBeVisible();

			fireEvent.error( logo as HTMLImageElement );

			expect( card.querySelector( 'img' ) ).not.toBeInTheDocument();
			expect( card.querySelector( 'svg' ) ).toBeVisible();
		} );

		it( 'hides the AI tool card and skips the assignment with the feature disabled', () => {
			isEnabled.mockImplementation(
				( flag: string ) =>
					flag !== 'site-spec/build-wow-blocks-first' &&
					flag !== 'onboarding/setup-your-site-ai-tool'
			);

			renderStep();

			expect( useAiToolExperiment ).toHaveBeenLastCalledWith( false );
			expect( viewCalls() ).toEqual( [] );

			expect( getButtonNames() ).toEqual( [
				'Create a custom design',
				'Start with a pre-made design',
			] );
		} );
	} );

	describe( 'with the site-spec feature disabled', () => {
		beforeEach( () => {
			isEnabled.mockImplementation( ( flag: string ) => flag !== 'site-spec' );
		} );

		it.each( [ 'ecommerce-bundle', 'ecommerce-trial-bundle-monthly' ] )(
			'keeps %s on build-with-ai',
			( planSlug ) => {
				setSitePlan( planSlug );

				renderStep();

				clickCustomDesign();

				expect( navigation.submit ).toHaveBeenCalledWith(
					expect.objectContaining( { setupChoice: 'build-with-ai' } )
				);
			}
		);

		it( 'submits the build-with-ai choice from the custom design card', () => {
			renderStep();

			clickCustomDesign();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'build-with-ai', has_prompt: false }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'build-with-ai',
				siteSlug: 'example.wordpress.com',
				siteId: 123,
			} );
		} );
	} );
} );
