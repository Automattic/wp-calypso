/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteData } from '../../../../../hooks/use-site-data';
import SetupYourSiteAIStep from '../index';

let mockQueryParams = new URLSearchParams();

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: jest.fn( () => ( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: jest.fn(),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn( () => ( { data: false } ) ),
} ) );

jest.mock( '@automattic/components', () => ( {
	BigSkyLogo: { CentralLogo: () => null },
	SummaryButton: ( { title, onClick }: { title: string; onClick: () => void } ) => (
		<button onClick={ onClick }>{ title }</button>
	),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		CenteredColumnLayout: ( { children }: { children: React.ReactNode } ) => (
			<div>{ children }</div>
		),
		TopBar: () => null,
		Heading: () => null,
		LinkButton: ( {
			children,
			onClick,
			className,
		}: {
			children: React.ReactNode;
			onClick: () => void;
			className?: string;
		} ) => (
			<button className={ className } onClick={ onClick }>
				{ children }
			</button>
		),
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

jest.mock( 'calypso/landing/stepper/utils/build-wow-plans', () => ( {
	planSupportsBuildWow: ( slug?: string ) => !! slug && slug !== 'personal-bundle',
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
	const mockUseReactQuery = useReactQuery as jest.Mock;
	const mockUseSiteData = useSiteData as jest.Mock;
	const isEnabled = jest.spyOn( config, 'isEnabled' );
	const navigation = { submit: jest.fn() };

	const legacyLinkName = 'Create a custom design with the legacy site builder';
	const legacyNoteText = '(Note: this link is only visible to Automatticians)';

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

	const clickCustomDesign = () =>
		fireEvent.click( screen.getByRole( 'button', { name: 'Create a custom design' } ) );

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryParams = new URLSearchParams();
		isEnabled.mockReturnValue( true );
		mockUseReactQuery.mockReturnValue( { data: false } );
		setSitePlan( 'business-bundle' );
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

		it( 'submits the generate-theme choice from the custom design card with the swap enabled', () => {
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

		it( 'submits the build-with-ai choice from the custom design card on a Personal plan', () => {
			setSitePlan( 'personal-bundle' );

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

		it( 'submits a choice only once per visit', () => {
			renderStep();

			clickCustomDesign();
			clickCustomDesign();
			fireEvent.click( screen.getByRole( 'button', { name: 'Start with a template' } ) );

			expect( navigation.submit ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'legacy site builder link', () => {
		it( 'is hidden for non-Automatticians', () => {
			renderStep();

			expect( screen.queryByRole( 'button', { name: legacyLinkName } ) ).not.toBeInTheDocument();
			expect( screen.queryByText( legacyNoteText ) ).not.toBeInTheDocument();
		} );

		it( 'renders after the custom design card, with its note, for Automatticians', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Start with a template',
				'Create a custom design',
				legacyLinkName,
			] );
			expect( screen.getByText( legacyNoteText ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Generate Theme' ) ).not.toBeInTheDocument();
		} );

		it( 'submits the build-with-ai choice', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );

			renderStep();

			fireEvent.click( screen.getByRole( 'button', { name: legacyLinkName } ) );

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

		it( 'is hidden on a Personal plan, where the card already goes to the legacy builder', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );
			setSitePlan( 'personal-bundle' );

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Start with a template', 'Create a custom design' ] );
		} );

		it( 'is hidden on the Woo hosting solutions variant, which has no custom design card', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Build with AI', 'Start with a template' ] );
		} );
	} );

	describe( 'with the site builder swap disabled', () => {
		beforeEach( () => {
			isEnabled.mockImplementation(
				( flag: string ) => flag !== 'calypso/ai-site-builder-build-wow'
			);
		} );

		it( 'renders only the two cards for non-Automatticians', () => {
			renderStep();

			expect( getButtonNames() ).toEqual( [ 'Start with a template', 'Create a custom design' ] );
		} );

		it( 'renders the Generate Theme card instead of the legacy link for Automatticians', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Start with a template',
				'Create a custom design',
				'Generate Theme',
			] );
			expect( screen.queryByRole( 'button', { name: legacyLinkName } ) ).not.toBeInTheDocument();
			expect( screen.queryByText( legacyNoteText ) ).not.toBeInTheDocument();
		} );

		it( 'keeps the Generate Theme card on the Woo hosting solutions variant for Automatticians', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );
			mockQueryParams = new URLSearchParams( { ref: WOO_HOSTING_SOLUTIONS_REF } );

			renderStep();

			expect( getButtonNames() ).toEqual( [
				'Build with AI',
				'Start with a template',
				'Generate Theme',
			] );
		} );

		it( 'submits the build-with-ai choice from the custom design card', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );

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

		it( 'submits the generate-theme choice from the Generate Theme card', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );

			renderStep();

			fireEvent.click( screen.getByRole( 'button', { name: 'Generate Theme' } ) );

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
	} );
} );
