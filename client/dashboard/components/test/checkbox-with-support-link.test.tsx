/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import { CheckboxWithSupportLink } from '../checkbox-with-support-link';

const label = 'Is this purchase for business? <link>Learn more.</link>';
const supportContext = 'business-tax-rates-in-ohio-and-connecticut';

describe( '<CheckboxWithSupportLink>', () => {
	test( 'names the checkbox with the interpolated label', async () => {
		render(
			<CheckboxWithSupportLink
				label={ label }
				supportContext={ supportContext }
				checked={ false }
				onChange={ () => {} }
			/>
		);

		expect(
			await screen.findByRole( 'checkbox', {
				name: 'Is this purchase for business? Learn more.',
			} )
		).toBeVisible();
	} );

	test( 'renders the support link inline in the label', async () => {
		render(
			<CheckboxWithSupportLink
				label={ label }
				supportContext={ supportContext }
				checked={ false }
				onChange={ () => {} }
			/>
		);

		const link = await screen.findByRole( 'link', { name: /learn more/i } );
		expect( link.closest( 'label' ) ).toBeVisible();
	} );

	test( 'reports the new value when toggled', async () => {
		const onChange = jest.fn();
		render(
			<CheckboxWithSupportLink
				label={ label }
				supportContext={ supportContext }
				checked={ false }
				onChange={ onChange }
			/>
		);

		await userEvent.click( await screen.findByRole( 'checkbox' ) );

		expect( onChange ).toHaveBeenCalledWith( true );
	} );

	test( 'drops the label when it is hidden from vision', async () => {
		render(
			<CheckboxWithSupportLink
				label={ label }
				supportContext={ supportContext }
				checked={ false }
				onChange={ () => {} }
				hideLabelFromVision
			/>
		);

		expect( await screen.findByRole( 'checkbox' ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /learn more/i } ) ).not.toBeInTheDocument();
	} );
} );
