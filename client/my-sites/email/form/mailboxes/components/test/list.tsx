/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import {
	MailboxListProps,
	NewMailBoxList,
} from 'calypso/my-sites/email/form/mailboxes/components/list';
import { useGetDefaultFieldLabelText } from 'calypso/my-sites/email/form/mailboxes/components/use-get-default-field-label-text';
import { FIELD_MAILBOX } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

describe( '<NewMailBoxList /> suite', () => {
	const defaultProps = {
		onSubmit: () => undefined,
		provider: EmailProvider.Titan,
		selectedDomainName: 'example.com',
	} as MailboxListProps;

	const setup = ( propOverrides: Partial< MailboxListProps > = {} ) => {
		const { container } = render( <NewMailBoxList { ...defaultProps } { ...propOverrides } /> );
		return container;
	};

	it( 'Output should contain our input elements', () => {
		setup();

		expect( screen.getAllByRole( 'textbox' ).length ).toBeGreaterThan( 2 );
		expect( screen.getAllByRole( 'button' ).length ).toEqual( 1 );
	} );

	it( 'Form submission should trigger pre-validation of input fields', () => {
		setup();

		const {
			result: { current: displayText },
		} = renderHook( () => useGetDefaultFieldLabelText( FIELD_MAILBOX ) );

		fireEvent.blur( screen.getByRole( 'button' ) );

		const elements = screen.getAllByText( displayText as string );
		expect( elements ).toHaveLength( 1 );
		expect( elements[ 0 ] ).toBeInTheDocument();
	} );
} );
