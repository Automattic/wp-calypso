/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HelpCenterFeedbackForm from '../help-center-feedback-form';

const mockRateArticle = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/odie-client', () => ( {
	GetSupport: () => <div>support options</div>,
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: true } ),
} ) );

jest.mock( '../../hooks/use-rate-article', () => ( {
	useRateArticle: () => ( { mutate: mockRateArticle } ),
} ) );

function renderForm( userRating?: 1 | 2 | null ) {
	return render(
		<HelpCenterFeedbackForm
			postId={ 185130 }
			blogId={ 9619154 }
			userRating={ userRating }
			isEligibleForChat={ false }
			forceEmailSupport={ false }
		/>
	);
}

describe( 'HelpCenterFeedbackForm', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'asks for a rating when the article has not been rated', () => {
		renderForm( null );

		expect( screen.getByText( 'Was this helpful?' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Yes/ } ) ).toBeInTheDocument();
	} );

	it( 'shows the thank-you message instead of the buttons when already rated helpful', () => {
		renderForm( 1 );

		expect( screen.getByText( 'You found this article helpful.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Yes/ } ) ).not.toBeInTheDocument();
	} );

	it( 'shows the support options instead of the buttons when already rated not helpful', () => {
		renderForm( 2 );

		expect( screen.getByText( 'support options' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /No/ } ) ).not.toBeInTheDocument();
	} );

	it( 'stores the rating and records the event once when rating', () => {
		renderForm( null );

		fireEvent.click( screen.getByRole( 'button', { name: /Yes/ } ) );

		expect( mockRateArticle ).toHaveBeenCalledWith( {
			blogId: 9619154,
			postId: 185130,
			rating: 1,
		} );
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_article_feedback_click', {
			did_the_article_help: 'yes',
			post_id: 185130,
		} );
		expect( screen.getByText( 'You found this article helpful.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Yes/ } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the rating for the session only when the server sent no rating field', () => {
		renderForm( undefined );

		fireEvent.click( screen.getByRole( 'button', { name: /No/ } ) );

		expect( mockRateArticle ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'support options' ) ).toBeInTheDocument();
	} );
} );
