/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DomainGlueRecordsForm from '../form';
import type { DomainGlueRecord } from '@automattic/api-core';

const domainName = 'example.com';

interface RenderFormProps {
	initialData?: DomainGlueRecord | null;
	onSubmit?: ( data: DomainGlueRecord ) => void;
	isSubmitting?: boolean;
	isEdit?: boolean;
	submitButtonText?: string;
}

function renderForm( props: RenderFormProps = {} ) {
	const defaultProps = {
		domainName,
		onSubmit: jest.fn(),
		isSubmitting: false,
		isEdit: false,
		submitButtonText: 'Add record',
		...props,
	};

	return render( <DomainGlueRecordsForm { ...defaultProps } /> );
}

test( 'renders domain glue records form with correct fields', async () => {
	renderForm();

	expect( screen.getByText( /Name server/ ) ).toBeInTheDocument();
	expect( screen.getByText( /IP address/ ) ).toBeInTheDocument();
	expect( screen.getByRole( 'button', { name: 'Add record' } ) ).toBeInTheDocument();
} );

test( 'pre-fills form with initial data when provided', async () => {
	const initialData = {
		nameserver: 'ns1',
		ip_addresses: [ '1.2.3.4' ],
	};

	renderForm( {
		initialData,
	} );

	expect( screen.getByDisplayValue( 'ns1' ) ).toBeInTheDocument();
	expect( screen.getByDisplayValue( '1.2.3.4' ) ).toBeInTheDocument();
} );

test( 'calls onSubmit with correct data when form is submitted', async () => {
	const user = userEvent.setup();
	const mockOnSubmit = jest.fn();

	renderForm( { onSubmit: mockOnSubmit } );

	// Fill in valid nameserver
	const nameserverInput = screen.getByRole( 'textbox', { name: /Name server/ } );
	await user.type( nameserverInput, 'ns1' );

	// Fill in valid IP address
	const ipAddressInput = screen.getByRole( 'textbox', { name: /IP address/ } );
	await user.type( ipAddressInput, '1.2.3.4' );

	// Submit the form
	const submitButton = screen.getByRole( 'button', { name: 'Add record' } );
	await user.click( submitButton );

	expect( mockOnSubmit ).toHaveBeenCalledWith( {
		nameserver: `ns1.${ domainName }`,
		ip_addresses: [ '1.2.3.4' ],
	} );
} );

test( 'nameserver is read only when isEdit is true', async () => {
	renderForm( { isEdit: true, initialData: { nameserver: 'ns1', ip_addresses: [ '1.2.3.4' ] } } );

	// Check that the nameserver value is rendered as text
	expect( screen.getByText( 'ns1' ) ).toBeInTheDocument();

	// There should be no textbox for nameserver
	expect( screen.queryByRole( 'textbox', { name: /Name server/ } ) ).toBeNull();
} );

test( 'disables submit button when isSubmitting is true', async () => {
	renderForm( { isSubmitting: true } );

	const submitButton = screen.getByRole( 'button', { name: 'Add record' } );
	expect( submitButton ).toBeDisabled();
} );

test( 'shows validation error when nameserver is invalid', async () => {
	const user = userEvent.setup();

	renderForm();

	// Fill in invalid nameserver
	const nameserverInput = screen.getByRole( 'textbox', { name: /Name server/ } );
	await user.type( nameserverInput, '(╯°□°)╯︵ ┻━┻' );
	await user.tab(); // This will blur the field

	// Validation error should appear after blur
	expect( screen.getByText( 'Please enter a valid name server.' ) ).toBeInTheDocument();
} );

test( 'shows validation error when IP address is invalid', async () => {
	const user = userEvent.setup();

	renderForm();

	// Fill in invalid IP address
	const ipAddressInput = screen.getByRole( 'textbox', { name: /IP address/ } );
	await user.type( ipAddressInput, '(-■_■)' );
	await user.tab(); // This will blur the field

	// Validation error should appear after blur
	expect( screen.getByText( 'Please enter a valid IP address.' ) ).toBeInTheDocument();
} );
