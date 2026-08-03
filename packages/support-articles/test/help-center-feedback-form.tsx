import { recordTracksEvent } from '@automattic/calypso-analytics';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import HelpCenterFeedbackForm from '../src/components/help-center-feedback-form';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/odie-client', () => ( {
	GetSupport: () => null,
} ) );

jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: true } ),
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( { __: ( text: string ) => text } ),
} ) );

const renderFeedbackForm = ( postId: number, userId = 1 ) =>
	render(
		<HelpCenterFeedbackForm
			postId={ postId }
			userId={ userId }
			isEligibleForChat={ false }
			forceEmailSupport={ false }
		/>
	);

describe( 'HelpCenterFeedbackForm', () => {
	beforeEach( () => {
		window.localStorage.clear();
		jest.mocked( recordTracksEvent ).mockClear();
	} );

	it( 'does not offer another rating after remounting an article in the same browser', () => {
		const { unmount } = renderFeedbackForm( 123 );

		fireEvent.click( screen.getByRole( 'button', { name: /yes/i } ) );

		expect( screen.getByText( 'Great! Thanks.' ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_article_feedback_click', {
			did_the_article_help: 'yes',
			post_id: 123,
		} );

		unmount();
		renderFeedbackForm( 123 );

		expect( screen.queryByRole( 'button', { name: /yes/i } ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Great! Thanks.' ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'allows rating a different article in the same browser', () => {
		const { unmount } = renderFeedbackForm( 123 );
		fireEvent.click( screen.getByRole( 'button', { name: /no/i } ) );
		unmount();

		renderFeedbackForm( 456 );

		expect( screen.getByRole( 'button', { name: /yes/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /no/i } ) ).toBeVisible();
	} );

	it( 'keeps ratings isolated between users', () => {
		const { unmount } = renderFeedbackForm( 123, 1 );
		fireEvent.click( screen.getByRole( 'button', { name: /yes/i } ) );
		unmount();

		renderFeedbackForm( 123, 2 );

		expect( screen.getByRole( 'button', { name: /yes/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /no/i } ) ).toBeVisible();
	} );

	it( 'does not record feedback already stored by another tab', () => {
		renderFeedbackForm( 123, 1 );
		window.localStorage.setItem( 'help-center-article-feedback-1-123', '1' );

		fireEvent.click( screen.getByRole( 'button', { name: /no/i } ) );

		expect( screen.getByText( 'Great! Thanks.' ) ).toBeVisible();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
