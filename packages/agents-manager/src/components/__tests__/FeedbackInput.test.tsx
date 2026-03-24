/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
