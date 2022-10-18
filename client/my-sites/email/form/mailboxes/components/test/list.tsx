/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import nock from 'nock';
import { ReactChild } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
	MailboxListProps,
	NewMailBoxList,
} from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import { useGetDefaultFieldLabelText } from 'calypso/my-sites/email/form/mailboxes/components/use-get-default-field-label-text';
import { FIELD_MAILBOX } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

function renderWithStore( element: ReactChild ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore( ( state ) => state, { ui: { selectedSiteId: 1 } } );
	return {
		...render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ element }</Provider>
			</QueryClientProvider>
		),
		store,
	};
}

describe( '<NewMailBoxList /> suite', () => {
	beforeAll( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/wpcom/v2/sites/1/emails/accounts/example.com/mailboxes' )
			.reply( 200, { accounts: [] } );
	} );

	const defaultProps = {
		onSubmit: () => undefined,
		provider: EmailProvider.Titan,
		selectedDomainName: 'example.com',
		hiddenFieldNames: [],
	} as MailboxListProps;

	const setup = ( propOverrides: Partial< MailboxListProps > = {} ) => {
		const { container } = renderWithStore(
			<NewMailBoxList { ...defaultProps } { ...propOverrides } />
		);
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
