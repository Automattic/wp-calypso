/**
 * @jest-environment jsdom
 */
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'redux';
import Form from 'calypso/a8c-for-agencies/components/form';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ContactOptionsPreview from '../contact-options-preview';

test( 'keeps invalid contact drafts and Enter isolated from parent form submission', async () => {
	const store = createStore( () => ( {
		countries: {
			sms: [ { code: 'ES', name: 'Spain (+34)', numeric_code: '+34', country_name: 'Spain' } ],
		},
	} ) );
	renderWithProvider(
		<Form>
			<input aria-label="Existing preference" defaultValue="saved" />
			<ContactOptionsPreview countryCode="ES" />
			<button type="submit">Save profile</button>
		</Form>,
		{ store }
	);
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
	expect( fireEvent.keyDown( country, { key: 'Enter', code: 'Enter' } ) ).toBe( false );
	expect( onSubmit ).not.toHaveBeenCalled();
	expect( form ).toBeValid();
	await userEvent.click( saveButton );
	expect( onSubmit ).toHaveBeenCalledTimes( 1 );
} );
