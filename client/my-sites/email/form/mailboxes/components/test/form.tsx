/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { MailboxFormWrapper } from 'calypso/my-sites/email/form/mailboxes/components/form';
import { useGetDefaultFieldLabelText } from 'calypso/my-sites/email/form/mailboxes/components/use-get-default-field-label-text';
import { FIELD_MAILBOX } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import type { MailboxFormWrapperProps } from 'calypso/my-sites/email/form/mailboxes/components/form';

describe( '<MailboxFormWrapper /> suite', () => {
	const defaultProps = {
		onSubmit: () => undefined,
		provider: EmailProvider.Google,
		selectedDomainName: 'example.com',
	} as MailboxFormWrapperProps;

	const setup = () => {
		const { container } = render( <MailboxFormWrapper { ...defaultProps } /> );
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

		fireEvent.click( screen.getByRole( 'button' ) );

		const elements = screen.getAllByText( displayText as string );
		expect( elements ).toHaveLength( 1 );
		expect( elements[ 0 ] ).toBeInTheDocument();
	} );
} );
