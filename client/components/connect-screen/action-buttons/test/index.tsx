/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ActionButtons } from '../index';

describe( 'ActionButtons', () => {
	const mockPrimaryClick = jest.fn();
	const mockSecondaryClick = jest.fn();
	const mockTertiaryClick = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'basic rendering', () => {
		it( 'renders primary button with label', () => {
			render( <ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } /> );
			expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeInTheDocument();
		} );

		it( 'renders secondary button when provided', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					secondaryLabel="Decline"
					secondaryOnClick={ mockSecondaryClick }
				/>
			);
			expect( screen.getByRole( 'button', { name: 'Decline' } ) ).toBeInTheDocument();
		} );

		it( 'renders tertiary button when provided', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					tertiaryLabel="Switch Account"
					tertiaryOnClick={ mockTertiaryClick }
				/>
			);
			expect( screen.getByRole( 'button', { name: 'Switch Account' } ) ).toBeInTheDocument();
		} );

		it( 'does not render secondary button when not provided', () => {
			render( <ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } /> );
			expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Decline' } ) ).not.toBeInTheDocument();
		} );

		it( 'does not render tertiary button when not provided', () => {
			render( <ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } /> );
			expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Switch Account' } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'click handlers', () => {
		it( 'calls primaryOnClick when primary button is clicked', () => {
			render( <ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } /> );
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
			expect( mockPrimaryClick ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'calls secondaryOnClick when secondary button is clicked', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					secondaryLabel="Decline"
					secondaryOnClick={ mockSecondaryClick }
				/>
			);
			fireEvent.click( screen.getByRole( 'button', { name: 'Decline' } ) );
			expect( mockSecondaryClick ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'custom classNames', () => {
		it( 'applies primaryClassName to primary button', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					primaryClassName="custom-primary"
				/>
			);
			const button = screen.getByRole( 'button', { name: 'Accept' } );
			expect( button ).toHaveClass( 'custom-primary' );
		} );

		it( 'applies secondaryClassName to secondary button', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					secondaryLabel="Decline"
					secondaryOnClick={ mockSecondaryClick }
					secondaryClassName="custom-secondary"
				/>
			);
			const button = screen.getByRole( 'button', { name: 'Decline' } );
			expect( button ).toHaveClass( 'custom-secondary' );
		} );

		it( 'applies className to wrapper', () => {
			const { container } = render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					className="custom-wrapper"
				/>
			);
			const wrapper = container.firstChild;
			expect( wrapper ).toHaveClass( 'connect-screen-action-buttons' );
			expect( wrapper ).toHaveClass( 'custom-wrapper' );
		} );
	} );

	describe( 'loading state', () => {
		it( 'shows spinner when primaryLoading is true', () => {
			const { container } = render(
				<ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } primaryLoading />
			);
			expect( container.querySelector( '.components-spinner' ) ).toBeInTheDocument();
		} );

		it( 'disables primary button when primaryLoading is true', () => {
			render(
				<ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } primaryLoading />
			);
			expect( screen.getByRole( 'button' ) ).toBeDisabled();
		} );

		it( 'disables secondary button when primaryLoading is true', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					secondaryLabel="Decline"
					secondaryOnClick={ mockSecondaryClick }
					primaryLoading
				/>
			);
			expect( screen.getByRole( 'button', { name: 'Decline' } ) ).toBeDisabled();
		} );
	} );

	describe( 'disabled state', () => {
		it( 'disables primary button when primaryDisabled is true', () => {
			render(
				<ActionButtons primaryLabel="Accept" primaryOnClick={ mockPrimaryClick } primaryDisabled />
			);
			expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeDisabled();
		} );

		it( 'disables secondary button when secondaryDisabled is true', () => {
			render(
				<ActionButtons
					primaryLabel="Accept"
					primaryOnClick={ mockPrimaryClick }
					secondaryLabel="Decline"
					secondaryOnClick={ mockSecondaryClick }
					secondaryDisabled
				/>
			);
			expect( screen.getByRole( 'button', { name: 'Decline' } ) ).toBeDisabled();
		} );
	} );
} );
