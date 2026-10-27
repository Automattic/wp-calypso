/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import MultiStepForm from '../index';
import type { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';

jest.mock( '../contact-form', () => ( {
	__esModule: true,
	default: ( {
		onContinue,
	}: {
		onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	} ) => (
		<button onClick={ () => onContinue( { agencyName: 'Test agency' } ) }>
			Continue to step 2
		</button>
	),
} ) );

jest.mock( '../hooks/use-submit-signup', () => ( {
	__esModule: true,
	default: () => jest.fn(),
} ) );

jest.mock( '../../../../hooks/use-create-signup-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutate: jest.fn(), isPending: false } ),
} ) );

jest.mock(
	'calypso/a8c-for-agencies/sections/signup/agency-details-form/hooks/use-countries-and-states',
	() => ( {
		useCountriesAndStates: () => ( { countryOptions: [] } ),
	} )
);

jest.mock( 'calypso/a8c-for-agencies/hooks/use-is-dark-mode', () => ( {
	useIsDarkMode: () => false,
} ) );

describe( 'MultiStepForm', () => {
	it( 'keeps the personalization answers after going back to step 1 and continuing again', async () => {
		const user = userEvent.setup();
		renderWithProvider( <MultiStepForm /> );

		await user.click( screen.getByRole( 'button', { name: 'Continue to step 2' } ) );

		await user.selectOptions(
			screen.getByRole( 'combobox', { name: /size of your agency/ } ),
			'11-25'
		);
		await user.selectOptions(
			screen.getByRole( 'combobox', { name: /sites do you manage/ } ),
			'21-50'
		);
		await user.click( screen.getByRole( 'checkbox', { name: 'Ecommerce development' } ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'Jetpack' } ) );

		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Continue to step 2' } ) );

		expect( screen.getByRole( 'combobox', { name: /size of your agency/ } ) ).toHaveValue(
			'11-25'
		);
		expect( screen.getByRole( 'combobox', { name: /sites do you manage/ } ) ).toHaveValue(
			'21-50'
		);
		expect( screen.getByRole( 'checkbox', { name: 'Ecommerce development' } ) ).toBeChecked();
		expect( screen.getByRole( 'checkbox', { name: 'Jetpack' } ) ).toBeChecked();
	} );
} );
