/**
 * @vitest-environment jsdom
 */
import { EmailProvider } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { render as testingLibraryRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { AnalyticsProvider } from '../../../app/analytics';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from '../../../app/context';
import { render } from '../../../test-utils';
import AddEmailForwarder from '../index';
import type { EmailAccount } from '@automattic/api-core';

// The shared test-utils router has no `/emails` route, so render the form at its real
// URL with a small router of its own. The app's route objects stay out of it: adding them
// to a router registers them for the whole file and breaks the tests that use `render()`.
function renderAtUrl( url: string ) {
	const root = createRootRoute( { component: Outlet } );
	const emails = createRoute( {
		getParentRoute: () => root,
		path: 'emails',
		component: Outlet,
	} );
	const addForwarder = createRoute( {
		getParentRoute: () => emails,
		path: 'add-forwarder',
		component: AddEmailForwarder,
	} );
	const router = createRouter( {
		routeTree: root.addChildren( [ emails.addChildren( [ addForwarder ] ) ] ),
		history: createMemoryHistory( { initialEntries: [ url ] } ),
	} );

	return testingLibraryRender(
		<QueryClientProvider
			client={ new QueryClient( { defaultOptions: { queries: { retry: false } } } ) }
		>
			<AppProvider config={ APP_CONTEXT_DEFAULT_CONFIG }>
				<AnalyticsProvider client={ { recordTracksEvent: vi.fn(), recordPageView: vi.fn() } }>
					<RouterProvider router={ router } />
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);
}

const DOMAIN = 'example.com';

function mockApi( { accounts }: { accounts?: EmailAccount[] } = {} ) {
	// Eligible forwarding domain so the form renders.
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1/me/mailboxes' )
		.query( true )
		.reply(
			200,
			accounts ?? [
				{
					account_type: EmailProvider.Forwarding,
					can_user_add_email: true,
					domains: [ { domain: DOMAIN } ],
				},
			]
		);

	// Existing forwarders for the eligible domain (queried on render).
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ DOMAIN }/email` )
		.query( true )
		.reply( 200, { forwards: [], max_forwards: 100 } )
		.persist();
}

describe( '<AddEmailForwarder>', () => {
	// DOTMSD-1342
	test( 'keeps Save disabled and shows a required-fields hint for an empty form', async () => {
		mockApi();
		render( <AddEmailForwarder /> );

		// The form renders once the eligible domain loads.
		expect( await screen.findByLabelText( 'Forward to' ) ).toBeVisible();

		expect( screen.getByText( /add at least one forwarding address to continue/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
	} );

	// DOTMSD-1342
	test( 'rejects an invalid email in the Forward to field', async () => {
		mockApi();
		const user = userEvent.setup();
		render( <AddEmailForwarder /> );

		const forwardTo = await screen.findByLabelText( 'Forward to' );
		await user.type( forwardTo, 'notanemail{Enter}' );

		// A malformed value is not tokenized, so the verification notice never appears.
		expect(
			screen.queryByText( /set up an email forwarder to notanemail/i )
		).not.toBeInTheDocument();
		// Instead, an inline error explains the input is invalid.
		expect( screen.getByText( 'Please enter a valid email address.' ) ).toBeVisible();
		// The Save button stays disabled because there is no valid forwarding address.
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
	} );

	// DOTMSD-1342
	test( 'accepts multiple valid forwarding addresses', async () => {
		mockApi();
		const user = userEvent.setup();
		render( <AddEmailForwarder /> );

		const forwardTo = await screen.findByLabelText( 'Forward to' );
		await user.type( forwardTo, 'first@example.com{Enter}second@example.com{Enter}' );

		expect( screen.getByText( 'first@example.com' ) ).toBeVisible();
		expect( screen.getByText( 'second@example.com' ) ).toBeVisible();
		expect( screen.queryByText( 'Please enter a valid email address.' ) ).not.toBeInTheDocument();
	} );

	// DOTMSD-1477
	test( 'offers a domain the user cannot buy paid email for', async () => {
		mockApi( {
			accounts: [
				{
					account_type: EmailProvider.Forwarding,
					can_user_add_email: false,
					domains: [ { domain: DOMAIN } ],
				} as EmailAccount,
			],
		} );
		render( <AddEmailForwarder /> );

		expect( await screen.findByLabelText( 'Forward to' ) ).toBeVisible();
		expect( screen.getByRole( 'option', { name: DOMAIN } ) ).toBeInTheDocument();
		expect(
			screen.queryByText( 'You do not have any domains eligible for email forwarding.' )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the empty state when no domain supports forwarding', async () => {
		mockApi( { accounts: [] } );
		render( <AddEmailForwarder /> );

		expect(
			await screen.findByText( 'You do not have any domains eligible for email forwarding.' )
		).toBeVisible();
	} );

	test( 'preselects the domain named in the URL', async () => {
		mockApi();
		renderAtUrl( `/emails/add-forwarder?domainName=${ DOMAIN }` );

		expect( await screen.findByRole( 'combobox', { name: 'Domain' } ) ).toHaveValue( DOMAIN );
	} );
} );
