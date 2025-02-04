/**
 * @jest-environment jsdom
 */
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-field';
import { useGetDefaultFieldLabelText } from 'calypso/my-sites/email/form/mailboxes/components/use-get-default-field-label-text';
import { FIELD_FIRSTNAME } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import type { MailboxFormFieldProps } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-field';
import type { MutableFormFieldNames } from 'calypso/my-sites/email/form/mailboxes/types';

describe( '<MailboxField /> suite', () => {
	const getDefaultProps = (
		fieldName: MutableFormFieldNames,
		initialValue?: string
	): MailboxFormFieldProps => {
		const provider = EmailProvider.Google;
		const selectedDomainName = 'example.com';
		const mailbox = new MailboxForm< EmailProvider >( provider, selectedDomainName );

		if ( initialValue ) {
			mailbox.setFieldValue( fieldName, initialValue );
		}

		return {
			onRequestFieldValidation(): void {
				mailbox.validateField( fieldName );
			},
			field: Reflect.get( mailbox.formFields, fieldName ),
		};
	};

	const setup = ( fieldName: MutableFormFieldNames, initialValue?: string ) => {
		const defaultProps = getDefaultProps( fieldName, initialValue );
		const { result } = renderHook( () => useGetDefaultFieldLabelText( fieldName ) );
		render( <MailboxField { ...defaultProps } /> );

		const element = screen.getByLabelText( result.current as string );

		return { defaultProps, element };
	};

	it( 'Output should contain our input element', () => {
		const { element } = setup( FIELD_FIRSTNAME );

		expect( element ).toBeInTheDocument();
	} );

	it( 'Input element should mirror mailbox value via the change event', () => {
		const { defaultProps, element } = setup( FIELD_FIRSTNAME, 'John' );

		expect( screen.getByDisplayValue( 'John' ) ).toBeInTheDocument();

		fireEvent.change( element, { target: { value: 'John-Pierre' } } );

		expect( screen.getByDisplayValue( 'John-Pierre' ) ).toBeInTheDocument();
		expect( defaultProps.field.value ).toBe( 'John-Pierre' );
	} );

	it( 'Input element should not fire off validation without an initial onblur event', () => {
		const { defaultProps, element } = setup( FIELD_FIRSTNAME );

		fireEvent.change( element, { target: { value: 'First' } } );
		fireEvent.change( element, { target: { value: '' } } ); // Should normally trigger "field required" error

		expect( defaultProps.field.error ).toBeNull();
	} );

	it( 'Input value should be valid when the element is not touched and looses focus', () => {
		const { defaultProps, element } = setup( FIELD_FIRSTNAME );

		// A blur with no previous change
		fireEvent.blur( element );

		const error = defaultProps.field.error;

		expect( error ).toBeNull();
	} );

	it( 'Input value should not be valid when the element is touched and looses focus with invalid value', () => {
		const { defaultProps, element } = setup( FIELD_FIRSTNAME );

		// Clear the field so that we can trigger a 'required' error
		fireEvent.change( element, { target: { value: '  ' } } );
		fireEvent.blur( element );

		const error = defaultProps.field.error;

		expect( error ).toBeTruthy();
		expect( screen.getByText( error as string ) ).toBeInTheDocument();
	} );

	it( 'Input element should fire off validation after an onblur event, or if an error is already displayed', () => {
		const { defaultProps, element } = setup( FIELD_FIRSTNAME );

		fireEvent.change( element, { target: { value: '  ' } } ); // Invalid value at first
		fireEvent.blur( element );

		expect( defaultProps.field.error ).toBeTruthy(); // An error exists

		fireEvent.change( element, { target: { value: 'John' } } ); // Now a valid value

		expect( defaultProps.field.error ).toBeNull(); // Error should be gone
	} );
} );
