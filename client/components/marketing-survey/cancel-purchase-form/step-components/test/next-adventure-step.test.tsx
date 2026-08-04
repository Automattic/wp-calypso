/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import NextAdventureStep from '../next-adventure-step';

const SUBTITLE = 'Before you go, please answer a quick question to help us improve WordPress.com.';

describe( 'NextAdventureStep', () => {
	// The cancel intents fire their mutation before the survey renders, so their
	// headings can state that the cancellation already happened.
	describe( 'with a cancel intent (mutation already fired)', () => {
		it( 'shows "Cancellation confirmed" title with subtitle when isOnlyStep and cancel intent', () => {
			render(
				<NextAdventureStep isPlan={ false } isOnlyStep adventureOptions={ [] } intent="cancel" />
			);
			expect( screen.getByRole( 'heading', { name: /Cancellation confirmed/ } ) ).toBeVisible();
			expect( screen.getByText( SUBTITLE ) ).toBeVisible();
		} );

		it( 'shows "Auto-renew disabled" title with subtitle when isOnlyStep and auto-renew intent', () => {
			render(
				<NextAdventureStep
					isPlan={ false }
					isOnlyStep
					adventureOptions={ [] }
					intent="auto-renew"
				/>
			);
			expect( screen.getByRole( 'heading', { name: /Auto-renew disabled/ } ) ).toBeVisible();
			expect( screen.getByText( SUBTITLE ) ).toBeVisible();
		} );

		it( 'shows "Thanks for your feedback" title without subtitle in multi-step cancel flow', () => {
			render(
				<NextAdventureStep
					isPlan={ false }
					isOnlyStep={ false }
					adventureOptions={ [] }
					intent="cancel"
				/>
			);
			expect( screen.getByRole( 'heading', { name: /Thanks for your feedback/ } ) ).toBeVisible();
			expect( screen.queryByText( SUBTITLE ) ).not.toBeInTheDocument();
		} );
	} );

	// Remove submits at survey-end, so nothing has happened yet.
	describe( 'with a remove intent (mutation deferred to survey-end)', () => {
		it( 'shows "Share your feedback" title with subtitle when isOnlyStep', () => {
			render(
				<NextAdventureStep isPlan={ false } isOnlyStep adventureOptions={ [] } intent="remove" />
			);
			expect( screen.getByRole( 'heading', { name: /Share your feedback/ } ) ).toBeVisible();
			expect( screen.getByText( SUBTITLE ) ).toBeVisible();
		} );

		it( 'shows "One last thing" title without subtitle in a multi-step flow', () => {
			render(
				<NextAdventureStep
					isPlan={ false }
					isOnlyStep={ false }
					adventureOptions={ [] }
					intent="remove"
				/>
			);
			expect( screen.getByRole( 'heading', { name: /One last thing/ } ) ).toBeVisible();
			expect( screen.queryByText( SUBTITLE ) ).not.toBeInTheDocument();
		} );
	} );

	// No intent means a legacy deep link, which also submits at survey-end. It
	// must never claim the cancellation is confirmed.
	describe( 'with no intent (legacy deep link)', () => {
		it( 'renders the pre-cancellation header regardless of isOnlyStep', () => {
			render( <NextAdventureStep isPlan={ false } isOnlyStep adventureOptions={ [] } /> );
			expect( screen.getByRole( 'heading', { name: /Sorry to see you go/ } ) ).toBeVisible();
			expect( screen.getByText( /One last thing/ ) ).toBeVisible();
			expect( screen.queryByText( SUBTITLE ) ).not.toBeInTheDocument();
		} );

		it( 'never claims the cancellation is confirmed', () => {
			render( <NextAdventureStep isPlan={ false } isOnlyStep adventureOptions={ [] } /> );
			expect(
				screen.queryByRole( 'heading', { name: /Cancellation confirmed/ } )
			).not.toBeInTheDocument();
		} );
	} );
} );
