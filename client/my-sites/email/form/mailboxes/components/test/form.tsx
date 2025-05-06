/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { MailboxFormWrapper } from 'calypso/my-sites/email/form/mailboxes/components/mailbox-form-wrapper';
import { useGetDefaultFieldLabelText } from 'calypso/my-sites/email/form/mailboxes/components/use-get-default-field-label-text';
import { FIELD_MAILBOX } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

describe( '<MailboxFormWrapper /> suite', () => {
	const mailbox = new MailboxForm( EmailProvider.Google, 'example.com' );

	const setup = () => {
		const { container } = render( <MailboxFormWrapper mailbox={ mailbox } /> );
		return container;
	};

	it( 'Output should contain our input elements', () => {
		setup();

		expect( screen.getAllByRole( 'textbox' ).length ).toBeGreaterThan( 2 );
	} );

	it( 'Element blur should trigger pre-validation of associated field', () => {
		setup();

		const {
			result: { current: displayText },
		} = renderHook( () => useGetDefaultFieldLabelText( FIELD_MAILBOX ) );

		fireEvent.blur( screen.getAllByRole( 'textbox' )[ 0 ] );

		const elements = screen.getAllByText( displayText as string );
		expect( elements ).toHaveLength( 1 );
		expect( elements[ 0 ] ).toBeInTheDocument();
	} );
} );
