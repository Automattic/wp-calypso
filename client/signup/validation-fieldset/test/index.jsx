/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ValidationFieldset from '..';

describe( 'ValidationFieldset', () => {
	test( 'should pass className prop to the child FormFieldset component.', () => {
		render( <ValidationFieldset className="test__foo-bar" /> );

		const fieldset = screen.getByRole( 'group' );
		expect( fieldset ).toBeVisible();
		expect( fieldset ).toHaveClass( 'test__foo-bar' );
	} );

	test( 'should include a FormInputValidation only when errorMessages prop is set.', () => {
		const { rerender } = render( <ValidationFieldset /> );

		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();

		rerender( <ValidationFieldset errorMessages={ [ 'error', 'message' ] } /> );

		const validationError = screen.queryByRole( 'alert' );
		expect( validationError ).toBeVisible();
		expect( validationError ).toHaveTextContent( 'error' );
		expect( validationError.parentNode ).toHaveClass( 'validation-fieldset__validation-message' );
	} );

	test( 'should render the children within a FormFieldset', () => {
		render(
			<ValidationFieldset>
				<p data-testid="paragraph-1">Lorem ipsum dolor sit amet</p>
				<p data-testid="paragraph-2">consectetur adipiscing elit</p>
			</ValidationFieldset>
		);

		const paragraph1 = screen.getByTestId( 'paragraph-1' );
		expect( paragraph1 ).toBeVisible();
		expect( paragraph1 ).toHaveTextContent( 'Lorem ipsum dolor sit amet' );
		expect( screen.getByTestId( 'paragraph-2' ) ).toBeVisible();
	} );
} );
