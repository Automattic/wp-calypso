/**
 * @jest-environment jsdom
 */
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

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryParams = new URLSearchParams();
		mockUseReactQuery.mockReturnValue( { data: false } );
		mockUseSiteData.mockReturnValue( { siteSlug: 'example.wordpress.com', siteId: 123 } );
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

	describe( 'Generate Theme (Automattician only)', () => {
		it( 'hides the Generate Theme option for non-Automatticians', () => {
			mockUseReactQuery.mockReturnValue( { data: false } );

			renderStep();

			expect( screen.queryByText( 'Generate Theme' ) ).not.toBeInTheDocument();
		} );

		it( 'shows Generate Theme and submits the generate-theme choice for Automatticians', () => {
			mockUseReactQuery.mockReturnValue( { data: true } );

			renderStep();

			const button = screen.getByText( 'Generate Theme' );
			expect( button ).toBeInTheDocument();

			fireEvent.click( button );

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
