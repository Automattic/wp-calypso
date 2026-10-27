/**
 * @jest-environment jsdom
 */
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'redux';
import Form from 'calypso/a8c-for-agencies/components/form';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ContactOptionsPreview from '../contact-options-preview';

test( 'isolates contact drafts from parent form submission and resets them for another agency', async () => {
	const store = createStore( () => ( {
		countries: {
			sms: [
				{
					code: 'US',
					name: 'United States (+1)',
					numeric_code: '+1',
					country_name: 'United States',
				},
				{ code: 'ES', name: 'Spain (+34)', numeric_code: '+34', country_name: 'Spain' },
			],
		},
	} ) );
	const renderForm = ( agencyId: number, countryCode: string ) => (
		<Form>
			<input aria-label="Existing preference" defaultValue="saved" />
			<ContactOptionsPreview key={ agencyId } countryCode={ countryCode } />
			<button type="submit">Save profile</button>
		</Form>
	);
	const view = renderWithProvider( renderForm( 123, 'ES' ), { store } );
	const saveButton = screen.getByRole( 'button', { name: 'Save profile' } );
	const form = saveButton.closest( 'form' )!;
	const onSubmit = jest.fn( ( event: Event ) => event.preventDefault() );
	form.addEventListener( 'submit', onSubmit );
	const country = screen.getByRole( 'combobox', { name: 'Country code' } );
	const phone = screen.getByRole( 'textbox', { name: 'Phone number (optional)' } );
	const booking = screen.getByRole( 'textbox', { name: /Booking link/ } );

	expect( country ).toHaveValue( 'ES' );
	await userEvent.type( phone, 'not a phone{Enter}' );
	await userEvent.type( booking, 'not a URL{Enter}' );
	await userEvent.selectOptions( country, 'US' );
	expect( fireEvent.keyDown( country, { key: 'Enter', code: 'Enter' } ) ).toBe( false );
	expect( onSubmit ).not.toHaveBeenCalled();
	expect( form ).toBeValid();
	await userEvent.click( saveButton );
	expect( onSubmit ).toHaveBeenCalledTimes( 1 );

	view.rerender( renderForm( 456, 'ES' ) );
	expect( screen.getByRole( 'combobox', { name: 'Country code' } ) ).toHaveValue( 'ES' );
	expect( screen.getByRole( 'textbox', { name: 'Phone number (optional)' } ) ).toHaveValue( '' );
	expect( screen.getByRole( 'textbox', { name: /Booking link/ } ) ).toHaveValue( '' );
	expect( screen.getByRole( 'textbox', { name: 'Existing preference' } ) ).toHaveValue( 'saved' );
} );
