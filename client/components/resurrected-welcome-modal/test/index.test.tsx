/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ResurrectedWelcomeModalGate } from '..';
import { WELCOME_BACK_VARIATIONS } from '../../../lib/resurrected-users/constants';

const mockRecordTracksEvent = jest.fn();
const mockUseLastDraftQuery = jest.fn();
const mockUseResurrectedFreeUserEligibility = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: ( ...args: unknown[] ) => mockRecordTracksEvent( ...args ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string, options?: { args?: Record< string, string > } ) =>
		Object.entries( options?.args ?? {} ).reduce(
			( translated, [ key, value ] ) => translated.replace( `%(${ key })s`, value ),
			text
		),
} ) );

jest.mock( 'calypso/data/posts/use-last-draft-query', () => ( {
	__esModule: true,
	default: ( ...args: unknown[] ) => mockUseLastDraftQuery( ...args ),
} ) );

jest.mock( 'calypso/lib/resurrected-users', () => ( {
	useResurrectedFreeUserEligibility: () => mockUseResurrectedFreeUserEligibility(),
} ) );

const contentEligibility = {
	isLoading: false,
	isResurrectedSixMonths: true,
	hasActivePaidSubscription: false,
	isEligible: true,
	variationName: WELCOME_BACK_VARIATIONS.content,
	isForcedVariation: true,
};

describe( 'ResurrectedWelcomeModalGate content variation', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
		mockRecordTracksEvent.mockReset();
		mockUseLastDraftQuery.mockReset();
		mockUseResurrectedFreeUserEligibility.mockReset();
		mockUseResurrectedFreeUserEligibility.mockReturnValue( contentEligibility );
	} );

	it( 'opens immediately with a busy new-post CTA while drafts load', async () => {
		mockUseLastDraftQuery.mockReturnValue( { data: undefined, isPending: true } );

		renderWithProvider( <ResurrectedWelcomeModalGate /> );

		const primaryCta = screen.getByRole( 'button', { name: 'Write your next post' } );
		expect( screen.getByRole( 'dialog' ) ).toBeVisible();
		expect( primaryCta ).toBeDisabled();
		expect( primaryCta ).toHaveClass( 'is-busy' );
		expect( screen.getByRole( 'link', { name: 'Create a new site' } ) ).toHaveAttribute(
			'href',
			'/setup/onboarding'
		);
		expect( mockUseLastDraftQuery ).toHaveBeenCalledWith( { enabled: true } );
		await waitFor( () =>
			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_resurrected_welcome_modal_impression',
				{ variation: WELCOME_BACK_VARIATIONS.content }
			)
		);
	} );

	it( 'updates the primary CTA when a titled draft is received', () => {
		mockUseLastDraftQuery.mockReturnValue( { data: undefined, isPending: true } );
		const { rerender } = renderWithProvider( <ResurrectedWelcomeModalGate /> );

		mockUseLastDraftQuery.mockReturnValue( {
			data: { id: 45, siteId: 67, title: 'My Draft' },
			isPending: false,
		} );
		rerender( <ResurrectedWelcomeModalGate /> );

		const draftCta = screen.getByRole( 'link', { name: 'Finish Draft: "My Draft"' } );
		expect( draftCta ).toHaveAttribute( 'href', '/post/67/45' );
		expect( draftCta ).toHaveAttribute( 'title', 'Finish Draft: "My Draft"' );
	} );

	it( 'truncates a long draft title while preserving the full title in the tooltip', () => {
		const draftTitle = '12345678901234567890123456789012345';
		mockUseLastDraftQuery.mockReturnValue( {
			data: { id: 45, siteId: 67, title: draftTitle },
			isPending: false,
		} );

		renderWithProvider( <ResurrectedWelcomeModalGate /> );

		const draftCta = screen.getByTitle( `Finish Draft: "${ draftTitle }"` );
		expect( draftCta ).toHaveTextContent( 'Finish Draft: "12345678901234567890123456789…"' );
		expect( draftCta ).toHaveAttribute( 'href', '/post/67/45' );
		expect( draftCta ).toHaveAttribute( 'title', `Finish Draft: "${ draftTitle }"` );
	} );

	it( 'uses a generic label for an untitled draft', () => {
		mockUseLastDraftQuery.mockReturnValue( {
			data: { id: 45, siteId: 67, title: '' },
			isPending: false,
		} );

		renderWithProvider( <ResurrectedWelcomeModalGate /> );

		expect( screen.getByRole( 'link', { name: 'Finish Draft' } ) ).toHaveAttribute(
			'href',
			'/post/67/45'
		);
	} );

	it.each( [ null, undefined ] )(
		'falls back to writing a new post when no draft is available',
		( data ) => {
			mockUseLastDraftQuery.mockReturnValue( { data, isPending: false } );

			renderWithProvider( <ResurrectedWelcomeModalGate /> );

			expect( screen.getByRole( 'link', { name: 'Write your next post' } ) ).toHaveAttribute(
				'href',
				'/post'
			);
		}
	);

	it( 'does not fetch drafts for another variation', () => {
		mockUseResurrectedFreeUserEligibility.mockReturnValue( {
			...contentEligibility,
			variationName: WELCOME_BACK_VARIATIONS.themes,
		} );
		mockUseLastDraftQuery.mockReturnValue( { data: undefined, isPending: true } );

		renderWithProvider( <ResurrectedWelcomeModalGate /> );

		expect( screen.getByRole( 'link', { name: 'Browse new themes' } ) ).toBeVisible();
		expect( mockUseLastDraftQuery ).toHaveBeenCalledWith( { enabled: false } );
	} );

	it( 'keeps the loading CTA inert', async () => {
		mockUseLastDraftQuery.mockReturnValue( { data: undefined, isPending: true } );
		const user = userEvent.setup();

		renderWithProvider( <ResurrectedWelcomeModalGate /> );
		await user.click( screen.getByRole( 'button', { name: 'Write your next post' } ) );

		expect( mockRecordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_resurrected_welcome_modal_cta_click',
			expect.anything()
		);
	} );
} );
