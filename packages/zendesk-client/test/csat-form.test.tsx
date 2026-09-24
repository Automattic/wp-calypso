/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CSATForm } from '../src/components/csat-form';

// jsdom doesn't implement scrollIntoView; CSATForm calls it when the feedback step mounts.
Element.prototype.scrollIntoView = jest.fn();

jest.mock( '../src/util', () => ( {
	getBadRatingReasons: () => [
		{ label: 'No reason provided', value: '' },
		{ label: 'Static reason', value: 'static-reason' },
	],
	isTestModeEnvironment: () => false,
} ) );

const mockMutateAsync = jest.fn();
let mockIsPending = false;

jest.mock( '../src/use-rate-chat', () => ( {
	useRateChat: () => ( {
		isPending: mockIsPending,
		mutateAsync: mockMutateAsync,
	} ),
} ) );

function getThumbsButtons() {
	const buttons = document.querySelectorAll< HTMLButtonElement >(
		'.zendesk-csat-form__thumbs-button'
	);
	return { thumbsUp: buttons[ 0 ], thumbsDown: buttons[ 1 ] };
}

describe( 'CSATForm', () => {
	beforeEach( () => {
		mockMutateAsync.mockReset().mockResolvedValue( undefined );
		mockIsPending = false;
	} );

	it( 'shows the rating message after a thumb is clicked when no score is predetermined', async () => {
		const onSendFeedback = jest.fn();
		render( <CSATForm ticketId={ 1 } onSendFeedback={ onSendFeedback } /> );

		const { thumbsUp } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsUp );
		} );

		expect( onSendFeedback ).toHaveBeenCalledWith( 'good' );
		expect( screen.getByText( 'Good 👍' ) ).toBeInTheDocument();
	} );

	it( 'does not show the rating message when preDeterminedScore is set', () => {
		render( <CSATForm ticketId={ 1 } preDeterminedScore="good" onSendFeedback={ jest.fn() } /> );

		expect( screen.queryByText( 'Good 👍' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the rating message when preDeterminedScore is set and showRatingMessageWithPreDeterminedScore is true', () => {
		render(
			<CSATForm
				ticketId={ 1 }
				preDeterminedScore="bad"
				showRatingMessageWithPreDeterminedScore
				onSendFeedback={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'Needs improvement 👎' ) ).toBeInTheDocument();
	} );

	it( 'does not render the thumbs buttons at all when preDeterminedScore is set', () => {
		render( <CSATForm ticketId={ 1 } preDeterminedScore="good" onSendFeedback={ jest.fn() } /> );

		expect( document.querySelectorAll( '.zendesk-csat-form__thumbs-button' ) ).toHaveLength( 0 );
	} );

	it( 'ignores a second click on the thumbs while the first submission is still in flight', async () => {
		let resolveFeedback: () => void = () => undefined;
		const onSendFeedback = jest.fn(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveFeedback = resolve;
				} )
		);
		render( <CSATForm ticketId={ 1 } onSendFeedback={ onSendFeedback } /> );

		const { thumbsUp } = getThumbsButtons();

		// Both clicks fire before the isSubmittingScore state update commits -- this is exactly
		// the race isSubmittingScoreRef exists to guard against.
		await act( async () => {
			fireEvent.click( thumbsUp );
			fireEvent.click( thumbsUp );
			resolveFeedback();
		} );

		expect( onSendFeedback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables the thumbs buttons while the score submission is pending', async () => {
		let resolveFeedback: () => void = () => undefined;
		const onSendFeedback = jest.fn(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveFeedback = resolve;
				} )
		);
		render( <CSATForm ticketId={ 1 } onSendFeedback={ onSendFeedback } /> );

		const { thumbsUp, thumbsDown } = getThumbsButtons();

		act( () => {
			fireEvent.click( thumbsUp );
		} );

		expect( thumbsUp ).toBeDisabled();
		expect( thumbsDown ).toBeDisabled();

		await act( async () => {
			resolveFeedback();
		} );

		expect( thumbsUp ).not.toBeDisabled();
		expect( thumbsDown ).not.toBeDisabled();
	} );

	it( 'hides the form without submitting anything when Send is clicked with no comment or reason', async () => {
		const onFormHidden = jest.fn();
		render(
			<CSATForm ticketId={ 1 } onSendFeedback={ jest.fn() } onFormHidden={ onFormHidden } />
		);

		const { thumbsUp } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsUp );
		} );

		await act( async () => {
			fireEvent.click( screen.getByText( 'Send' ) );
		} );

		expect( mockMutateAsync ).not.toHaveBeenCalled();
		expect( onFormHidden ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByText( 'Send' ) ).not.toBeInTheDocument();
	} );

	it( 'calls onFormHidden when No thanks is clicked', async () => {
		const onFormHidden = jest.fn();
		render(
			<CSATForm ticketId={ 1 } onSendFeedback={ jest.fn() } onFormHidden={ onFormHidden } />
		);

		const { thumbsUp } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsUp );
		} );

		await act( async () => {
			fireEvent.click( screen.getByText( 'No thanks' ) );
		} );

		expect( onFormHidden ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'calls rateChat with the ticket_id when a comment is submitted without onSendComment', async () => {
		render( <CSATForm ticketId={ 42 } onSendFeedback={ jest.fn() } /> );

		const { thumbsUp } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsUp );
		} );

		const textarea = document.querySelector( 'textarea' ) as HTMLTextAreaElement;
		await act( async () => {
			fireEvent.change( textarea, { target: { value: 'Great support!' } } );
		} );

		await act( async () => {
			fireEvent.click( screen.getByText( 'Send' ) );
		} );

		expect( mockMutateAsync ).toHaveBeenCalledWith( {
			ticket_id: 42,
			score: 'good',
			comment: 'Great support!',
			reason_id: '',
			test_mode: false,
		} );
	} );

	it( 'calls onSendComment instead of rateChat when onSendComment is provided', async () => {
		const onSendComment = jest.fn().mockResolvedValue( undefined );
		render(
			<CSATForm ticketId={ 1 } onSendFeedback={ jest.fn() } onSendComment={ onSendComment } />
		);

		const { thumbsDown } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsDown );
		} );

		const select = screen.getByLabelText( 'Reason' );
		await act( async () => {
			fireEvent.change( select, { target: { value: 'static-reason' } } );
		} );

		await act( async () => {
			fireEvent.click( screen.getByText( 'Send' ) );
		} );

		expect( onSendComment ).toHaveBeenCalledWith( '', 'static-reason', 'bad' );
		expect( mockMutateAsync ).not.toHaveBeenCalled();
	} );

	it( 'does not call rateChat when ticketId is null and onSendComment is not provided, but still hides the form', async () => {
		const onFormHidden = jest.fn();
		render(
			<CSATForm ticketId={ null } onSendFeedback={ jest.fn() } onFormHidden={ onFormHidden } />
		);

		const { thumbsDown } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsDown );
		} );

		const select = screen.getByLabelText( 'Reason' );
		await act( async () => {
			fireEvent.change( select, { target: { value: 'static-reason' } } );
		} );

		await act( async () => {
			fireEvent.click( screen.getByText( 'Send' ) );
		} );

		expect( mockMutateAsync ).not.toHaveBeenCalled();
		expect( onFormHidden ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the static reason options when reasonOptions is not provided', async () => {
		render( <CSATForm ticketId={ 1 } onSendFeedback={ jest.fn() } /> );

		const { thumbsDown } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsDown );
		} );

		expect( screen.getByText( 'Static reason' ) ).toBeInTheDocument();
	} );

	it( 'uses the provided reasonOptions, including an empty array, instead of the static list', async () => {
		render( <CSATForm ticketId={ 1 } onSendFeedback={ jest.fn() } reasonOptions={ [] } /> );

		const { thumbsDown } = getThumbsButtons();
		await act( async () => {
			fireEvent.click( thumbsDown );
		} );

		expect( screen.queryByText( 'Static reason' ) ).not.toBeInTheDocument();
	} );
} );
