/**
 * @jest-environment jsdom
 */
import { render, fireEvent, screen } from '@testing-library/react';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxField } from 'calypso/my-sites/email/form/mailboxes/components/field';
import { FIELD_FIRSTNAME } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import type { MailboxFormFieldProps } from 'calypso/my-sites/email/form/mailboxes/components/field';
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
			requestFieldValidation(): void {
				mailbox.validateField( fieldName );
			},
			domains: [],
			field: Reflect.get( mailbox.formFields, fieldName ),
			selectedDomainName,
		};
	};

	const getInputCollection = ( container: HTMLElement ): HTMLCollectionOf< HTMLInputElement > => {
		return container.getElementsByTagName( 'input' );
	};

	const getFirstInput = ( container: HTMLElement ): HTMLInputElement => {
		return getInputCollection( container ).item( 0 );
	};

	const setup = ( fieldName: MutableFormFieldNames, initialValue?: string ) => {
		const defaultProps = getDefaultProps( fieldName, initialValue );
		const { container } = render( <MailboxField { ...defaultProps } /> );

		return { defaultProps, container };
	};

	it( 'Output should contain one input element', () => {
		const { container } = setup( FIELD_FIRSTNAME );

		expect( getInputCollection( container ) ).toHaveLength( 1 );
	} );

	it( 'Input element should mirror mailbox value via the change event', () => {
		const { container, defaultProps } = setup( FIELD_FIRSTNAME, 'John' );

		expect( screen.getByDisplayValue( 'John' ) ).toBeInTheDocument();

		const input = getFirstInput( container );

		fireEvent.change( input, { target: { value: 'John-Pierre' } } );

		expect( screen.getByDisplayValue( 'John-Pierre' ) ).toBeInTheDocument();
		expect( defaultProps.field.value ).toBe( 'John-Pierre' );
	} );

	it( 'Input element should not fire off validation without an initial onblur event', () => {
		const { container, defaultProps } = setup( FIELD_FIRSTNAME );

		const input = getFirstInput( container );

		fireEvent.change( input, { target: { value: 'First' } } );
		fireEvent.change( input, { target: { value: '' } } ); // Should normally trigger "field required" error

		expect( defaultProps.field.error ).toBeNull();
	} );

	it( 'Input value should be validated when the element looses focus', () => {
		const { container, defaultProps } = setup( FIELD_FIRSTNAME );

		const input = getFirstInput( container );

		// Clear the field so that we can trigger a 'required' error
		fireEvent.change( input, { target: { value: '' } } );
		fireEvent.blur( input );

		const error = defaultProps.field.error;

		expect( error ).toBeTruthy();
		expect(
			screen
				.getByRole( 'alert' )
				?.innerHTML?.replace( /<[^>]*>?/gm, '' )
				?.trim()
		).toEqual( error as string );
	} );

	it( 'Input element should fire off validation after an onblur event, or if an error is already displayed', () => {
		const { container, defaultProps } = setup( FIELD_FIRSTNAME );

		const input = getFirstInput( container );

		fireEvent.change( input, { target: { value: '' } } ); // Invalid value at first
		fireEvent.blur( input );

		expect( defaultProps.field.error ).toBeTruthy(); // An error exists

		fireEvent.change( input, { target: { value: 'John' } } ); // Now a valid value

		expect( defaultProps.field.error ).toBeNull(); // Error should be gone
	} );
} );
