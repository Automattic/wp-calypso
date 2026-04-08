/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NextStepButton from '../next-step-button';

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		...props
	}: {
		children: React.ReactNode;
		onClick: () => void;
		[ key: string ]: unknown;
	} ) => (
		<button onClick={ onClick } { ...props }>
			{ children }
		</button>
	),
} ) );

jest.mock( '../../utils/canvas-zoom', () => ( {
	zoomIn: jest.fn(),
} ) );

describe( 'NextStepButton', () => {
	it( 'renders the button with correct text', () => {
		render( <NextStepButton onMoveToNextStep={ jest.fn() } /> );
		expect( screen.getByText( 'Move to next step' ) ).toBeInTheDocument();
	} );

	it( 'calls `onMoveToNextStep` after zoom in', async () => {
		const onMoveToNextStep = jest.fn();
		render( <NextStepButton onMoveToNextStep={ onMoveToNextStep } /> );
		await userEvent.click( screen.getByText( 'Move to next step' ) );
		await waitFor( () => {
			expect( onMoveToNextStep ).toHaveBeenCalledWith( 'Moving to next step' );
		} );
	} );
} );
