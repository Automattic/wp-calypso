/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { StepCounter } from '../StepCounter';

describe( 'StepCounter', () => {
	// The visible text is terse on purpose, so the spelled-out position lives in
	// the label. Moving this to `Text` must not drop either half.
	it( 'shows the position, and spells it out for screen readers', () => {
		render( <StepCounter current={ 2 } total={ 3 } /> );

		expect( screen.getByLabelText( 'Step 2 of 3' ) ).toHaveTextContent( '2 of 3' );
	} );
} );
