/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render, screen, fireEvent } from '@testing-library/react';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSignupCompleteSlug } from 'calypso/signup/storageUtils';
import { usePlanCartItem } from '../../../../../hooks/use-plan-cart-item';
import { useSiteData } from '../../../../../hooks/use-site-data';
import SetupYourSiteAIStep from '../index';

let mockQueryParams = new URLSearchParams();

jest.mock( '@automattic/components', () => ( {
	BigSkyLogo: { CentralLogo: () => null },
	SummaryButton: ( {
		title,
		onClick,
		disabled,
	}: {
		title: string;
		onClick: () => void;
		disabled?: boolean;
	} ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ title }
		</button>
	),
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
	default: { fixMe: ( { text }: { text: string } ) => text },
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteSlug: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/build-wow-plans', () => ( {
	planSupportsBuildWow: ( slug?: string ) => !! slug && slug !== 'pro-plan',
} ) );

jest.mock( '../../../../../hooks/use-plan-cart-item', () => ( {
	usePlanCartItem: jest.fn(),
} ) );

jest.mock( '../../../../../hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
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

	const setPlanCartItem = ( productSlug: string | null ) =>
		( usePlanCartItem as jest.Mock ).mockReturnValue(
			productSlug ? { product_slug: productSlug } : null
		);

	const clickCustomDesign = () =>
		fireEvent.click( screen.getByRole( 'button', { name: 'Create a custom design' } ) );

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryParams = new URLSearchParams();
		isEnabled.mockReturnValue( true );
		setSitePlan( 'business-bundle' );
		setPlanCartItem( null );
		( getSignupCompleteSlug as jest.Mock ).mockReturnValue( 'example.wordpress.com' );
	} );

	describe( 'card order', () => {
		it( 'renders the template card before the custom design card by default', () => {
			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Start with a template', 'Create a custom design' ] );
		} );

		it( 'keeps the AI prompt card before the template card for the Woo hosting solutions ref', () => {
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Build with AI', 'Start with a template' ] );
		} );
	} );

	describe( 'card selection', () => {
		it( 'submits the blank-site choice from the template card', () => {
			renderStep();

			fireEvent.click( screen.getByRole( 'button', { name: 'Start with a template' } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'blank-site' }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'blank-site',
				siteSlug: 'example.wordpress.com',
			} );
		} );

		it( 'submits the generate-theme choice from the custom design card on an Atomic-capable plan', () => {
			renderStep();

			clickCustomDesign();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_onboarding_setup_your_site_with_ai_selection',
				{ selection: 'generate-theme' }
			);
			expect( navigation.submit ).toHaveBeenCalledWith( {
				setupChoice: 'generate-theme',
				siteSlug: 'example.wordpress.com',
				siteId: 123,
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
			expect( screen.getByRole( 'button', { name: 'Start with a template' } ) ).toBeDisabled();

			const pageshow = new Event( 'pageshow' ) as PageTransitionEvent;
			Object.defineProperty( pageshow, 'persisted', { value: true } );
			fireEvent( window, pageshow );

			expect( screen.getByRole( 'button', { name: 'Start with a template' } ) ).toBeEnabled();
		} );

		it( 'submits a choice only once per visit and disables the controls', () => {
			renderStep();

			clickCustomDesign();
			clickCustomDesign();
			fireEvent.click( screen.getByRole( 'button', { name: 'Start with a template' } ) );

			expect( navigation.submit ).toHaveBeenCalledTimes( 1 );
			expect( screen.getByRole( 'button', { name: 'Start with a template' } ) ).toBeDisabled();
			expect( screen.getByRole( 'button', { name: 'Create a custom design' } ) ).toBeDisabled();
		} );
	} );

	describe( 'with the site-spec feature disabled', () => {
		beforeEach( () => {
			isEnabled.mockImplementation( ( flag: string ) => flag !== 'site-spec' );
		} );

		it( 'renders only the two cards', () => {
			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Start with a template', 'Create a custom design' ] );
		} );

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
