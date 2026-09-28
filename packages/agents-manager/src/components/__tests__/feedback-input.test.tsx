/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from '@wordpress/element';
import FeedbackInput from '../feedback-input';

describe( 'FeedbackInput', () => {
	const mockOnSubmit = jest.fn();
	const mockOnCancel = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		mockOnSubmit.mockResolvedValue( undefined );
	} );

	describe( 'rendering', () => {
		it( 'renders textarea with label and buttons', () => {
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			expect( screen.getByLabelText( /what could be improved/i ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( /help us understand/i ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /cancel/i } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /^submit$/i } ) ).toBeInTheDocument();
		} );

		it( 'focuses textarea on mount', () => {
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			expect( textarea ).toHaveFocus();
		} );

		it( 'disables submit button when textarea is empty', () => {
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			expect( submitButton ).toBeDisabled();
		} );

		it( 'enables submit button when textarea has text', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'This is helpful feedback' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			expect( submitButton ).toBeEnabled();
		} );
	} );

	describe( 'text input', () => {
		it( 'updates textarea value when user types', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test feedback' );

			expect( textarea ).toHaveValue( 'Test feedback' );
		} );

		it( 'allows multiline input', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Line 1{Enter}Line 2' );

			expect( textarea ).toHaveValue( 'Line 1\nLine 2' );
		} );
	} );

	describe( 'submission', () => {
		it( 'calls onSubmit with trimmed text when submit button is clicked', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, '  Feedback with spaces  ' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			expect( mockOnSubmit ).toHaveBeenCalledWith( 'Feedback with spaces' );
		} );

		it( 'submits with Cmd+Enter keyboard shortcut', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Quick feedback' );
			await user.keyboard( '{Meta>}{Enter}{/Meta}' );

			expect( mockOnSubmit ).toHaveBeenCalledWith( 'Quick feedback' );
		} );

		it( 'submits with Ctrl+Enter keyboard shortcut', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Quick feedback' );
			await user.keyboard( '{Control>}{Enter}{/Control}' );

			expect( mockOnSubmit ).toHaveBeenCalledWith( 'Quick feedback' );
		} );

		it( 'does not submit with Shift+Enter', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2' );

			expect( mockOnSubmit ).not.toHaveBeenCalled();
			expect( textarea ).toHaveValue( 'Line 1\nLine 2' );
		} );

		it( 'shows loading state while submitting', async () => {
			const user = userEvent.setup();
			let resolveSubmit: () => void;
			const submitPromise = new Promise< void >( ( resolve ) => {
				resolveSubmit = resolve;
			} );
			mockOnSubmit.mockReturnValue( submitPromise );

			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: /submitting/i } ) ).toBeInTheDocument();
			} );

			expect( textarea ).toBeDisabled();
			expect( screen.getByRole( 'button', { name: /cancel/i } ) ).toBeDisabled();

			resolveSubmit!();
		} );

		it( 'shows success message after successful submission', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			await waitFor( () => {
				expect( screen.getByText( /feedback submitted, thank you/i ) ).toBeInTheDocument();
			} );
		} );

		it( 'calls onCancel after successful submission delay', async () => {
			jest.useFakeTimers();
			const user = userEvent.setup( { delay: null } );

			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			await waitFor( () => {
				expect( screen.getByText( /feedback submitted/i ) ).toBeInTheDocument();
			} );

			expect( mockOnCancel ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( 2000 );

			expect( mockOnCancel ).toHaveBeenCalled();

			jest.useRealTimers();
		} );

		it( 'shows error message when submission fails', async () => {
			const user = userEvent.setup();
			mockOnSubmit.mockRejectedValue( new Error( 'Network error' ) );

			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			await waitFor( () => {
				expect( screen.getByText( /failed to submit feedback/i ) ).toBeInTheDocument();
			} );
		} );

		it( 'calls onCancel after error message delay', async () => {
			jest.useFakeTimers();
			const user = userEvent.setup( { delay: null } );
			mockOnSubmit.mockRejectedValue( new Error( 'Network error' ) );

			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			await waitFor( () => {
				expect( screen.getByText( /failed to submit/i ) ).toBeInTheDocument();
			} );

			expect( mockOnCancel ).not.toHaveBeenCalled();

			jest.advanceTimersByTime( 2000 );

			expect( mockOnCancel ).toHaveBeenCalled();

			jest.useRealTimers();
		} );

		it( 'does not submit empty or whitespace-only feedback', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, '   ' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			expect( submitButton ).toBeDisabled();
		} );

		it( 'removes textarea after successful submission', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Test feedback' );

			const submitButton = screen.getByRole( 'button', { name: /^submit$/i } );
			await user.click( submitButton );

			await waitFor( () => {
				expect( screen.getByText( /feedback submitted/i ) ).toBeInTheDocument();
			} );

			// Textarea is replaced by the success message
			expect( screen.queryByRole( 'textbox' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'cancellation', () => {
		it( 'calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const cancelButton = screen.getByRole( 'button', { name: /cancel/i } );
			await user.click( cancelButton );

			expect( mockOnCancel ).toHaveBeenCalled();
		} );

		it( 'calls onCancel when Escape key is pressed', async () => {
			const user = userEvent.setup();
			render( <FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } /> );

			const textarea = screen.getByRole( 'textbox' );
			await user.type( textarea, 'Some text{Escape}' );

			expect( mockOnCancel ).toHaveBeenCalled();
		} );
	} );

	describe( 'inline variant', () => {
		it( 'renders the plain form without an overlay or dialog by default', () => {
			const { container } = render(
				<div>
					<button>Popover control</button>
					<FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
				</div>
			);

			expect( container.querySelector( '.agents-manager-feedback-overlay' ) ).toBeNull();
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: /popover control/i } ) ).not.toHaveAttribute(
				'inert'
			);
		} );
	} );

	describe( 'dialog behavior', () => {
		it( 'renders as a dialog that is not modal to the page', () => {
			render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			const dialog = screen.getByRole( 'dialog', { name: /send feedback/i } );
			expect( dialog ).not.toHaveAttribute( 'aria-modal' );
		} );

		it( 'makes the rest of the chat inert while open and restores it on close', () => {
			const { unmount } = render(
				<div>
					<button>Chat control</button>
					<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
				</div>
			);

			const chatControl = screen.getByRole( 'button', { name: /chat control/i, hidden: true } );
			expect( chatControl ).toHaveAttribute( 'inert' );
			expect( screen.getByRole( 'dialog' ) ).not.toHaveAttribute( 'inert' );

			unmount();

			expect( chatControl ).not.toHaveAttribute( 'inert' );
		} );

		it( 'makes siblings mounted while it is open inert too', async () => {
			const { container } = render(
				<div>
					<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
				</div>
			);

			const lateCard = document.createElement( 'div' );
			lateCard.innerHTML = '<button>Late card</button>';
			container.firstElementChild!.appendChild( lateCard );

			await waitFor( () => {
				expect( lateCard ).toHaveAttribute( 'inert' );
			} );
		} );

		it( 'marks Escape as handled so the chat does not close on it', async () => {
			const user = userEvent.setup();
			const chatListener = jest.fn( ( event: KeyboardEvent ) => event.defaultPrevented );
			document.addEventListener( 'keydown', chatListener );
			render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			await user.keyboard( '{Escape}' );

			expect( mockOnCancel ).toHaveBeenCalledTimes( 1 );
			expect( chatListener ).toHaveReturnedWith( true );
			document.removeEventListener( 'keydown', chatListener );
		} );

		it( 'calls onCancel when the backdrop is clicked, but not the dialog itself', async () => {
			const user = userEvent.setup();
			const { container } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			await user.click( screen.getByRole( 'dialog' ) );
			expect( mockOnCancel ).not.toHaveBeenCalled();

			await user.click( container.querySelector( '.agents-manager-feedback-overlay' )! );
			expect( mockOnCancel ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'calls onCancel when Escape is pressed outside the textarea', async () => {
			const user = userEvent.setup();
			render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			screen.getByRole( 'button', { name: /cancel/i } ).focus();
			await user.keyboard( '{Escape}' );

			expect( mockOnCancel ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'ignores Escape and backdrop clicks while a submission is in flight', async () => {
			const user = userEvent.setup();
			let resolveSubmit: () => void = () => {};
			mockOnSubmit.mockReturnValue( new Promise< void >( ( r ) => ( resolveSubmit = r ) ) );
			const { container } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			await user.type( screen.getByRole( 'textbox' ), 'Some text' );
			await user.click( screen.getByRole( 'button', { name: /^submit$/i } ) );

			await user.keyboard( '{Escape}' );
			await user.click( container.querySelector( '.agents-manager-feedback-overlay' )! );
			expect( mockOnCancel ).not.toHaveBeenCalled();

			resolveSubmit();
			await waitFor( () => {
				expect( screen.getByRole( 'status' ) ).toBeInTheDocument();
			} );
		} );

		it( 'still completes a submission after StrictMode replays its effects', async () => {
			const user = userEvent.setup();
			render(
				<StrictMode>
					<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
				</StrictMode>
			);

			await user.type( screen.getByRole( 'textbox' ), 'Some text' );
			await user.click( screen.getByRole( 'button', { name: /^submit$/i } ) );

			await waitFor( () => {
				expect( screen.getByRole( 'status' ) ).toBeInTheDocument();
			} );
		} );

		it( 'moves focus to the dialog while no control inside can take it', async () => {
			const user = userEvent.setup();
			mockOnSubmit.mockReturnValue( new Promise< void >( () => {} ) );
			render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			await user.type( screen.getByRole( 'textbox' ), 'Some text' );
			await user.click( screen.getByRole( 'button', { name: /^submit$/i } ) );

			expect( screen.getByRole( 'dialog' ) ).toHaveFocus();
		} );

		it( 'does not schedule a close after unmounting mid-submission', async () => {
			const user = userEvent.setup();
			let resolveSubmit: () => void = () => {};
			mockOnSubmit.mockReturnValue( new Promise< void >( ( r ) => ( resolveSubmit = r ) ) );
			const { unmount } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			await user.type( screen.getByRole( 'textbox' ), 'Some text' );
			await user.click( screen.getByRole( 'button', { name: /^submit$/i } ) );

			unmount();
			jest.useFakeTimers();
			resolveSubmit();
			await Promise.resolve();
			jest.advanceTimersByTime( 3000 );
			jest.useRealTimers();

			expect( mockOnCancel ).not.toHaveBeenCalled();
		} );

		it( 'does not dismiss when a press started in the dialog is released over the backdrop', () => {
			const { container } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);
			const overlay = container.querySelector( '.agents-manager-feedback-overlay' )!;

			fireEvent.pointerDown( screen.getByRole( 'textbox' ) );
			fireEvent.click( overlay );

			expect( mockOnCancel ).not.toHaveBeenCalled();
		} );

		it( 'marks the overlay as a slot the floating chat does not drag from', () => {
			const { container } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			expect( container.querySelector( '.agents-manager-feedback-overlay' ) ).toHaveAttribute(
				'data-slot',
				'chat-dialog'
			);
		} );

		it( 'returns focus to the element that opened it when closed', () => {
			const opener = document.createElement( 'button' );
			document.body.appendChild( opener );
			opener.focus();

			const { unmount } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);
			expect( screen.getByRole( 'textbox' ) ).toHaveFocus();

			unmount();

			expect( opener ).toHaveFocus();
			opener.remove();
		} );

		it( 'leaves focus alone when the user has already moved on before it closes', () => {
			const opener = document.createElement( 'button' );
			const elsewhere = document.createElement( 'button' );
			document.body.append( opener, elsewhere );
			opener.focus();

			const { unmount } = render(
				<FeedbackInput variant="dialog" onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);
			elsewhere.focus();

			unmount();

			expect( elsewhere ).toHaveFocus();
			opener.remove();
			elsewhere.remove();
		} );
	} );

	describe( 'cleanup', () => {
		it( 'clears timeout on unmount', () => {
			jest.useFakeTimers();
			const { unmount } = render(
				<FeedbackInput onSubmit={ mockOnSubmit } onCancel={ mockOnCancel } />
			);

			unmount();

			// Should not throw or cause issues
			jest.advanceTimersByTime( 3000 );

			jest.useRealTimers();

			expect( mockOnCancel ).not.toHaveBeenCalled();
		} );
	} );
} );
