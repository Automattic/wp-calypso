/** @jest-environment jsdom */
import {
	bigSkyPluginQuery,
	queryClient,
	sitePostByEmailSettingsQuery,
} from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import WordPressAgentEmail from '../wordpress-agent-email';
import type { Site } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const SITE = {
	ID: 123,
	slug: 'email-agent.wordpress.com',
	name: 'Email Agent',
	URL: 'https://email-agent.wordpress.com',
	jetpack: false,
	is_wpcom_atomic: false,
	capabilities: { manage_options: true },
	site_migration: { in_progress: false, is_complete: false },
} as Site;
const ATOMIC_SITE = {
	...SITE,
	ID: 456,
	slug: 'atomic-email-agent.wpcomstaging.com',
	name: 'Atomic Email Agent',
	URL: 'https://atomic-email-agent.wpcomstaging.com',
	jetpack: true,
	is_wpcom_atomic: true,
} as Site;
const JETPACK_SITE = {
	...SITE,
	ID: 789,
	slug: 'jetpack-email-agent.example.com',
	name: 'Jetpack Email Agent',
	URL: 'https://jetpack-email-agent.example.com',
	jetpack: true,
	is_wpcom_atomic: false,
} as Site;
const sitesQuery = APP_CONTEXT_DEFAULT_CONFIG.queries.sitesQuery( {
	site_visibility: 'visible',
	include_a8c_owned: false,
} );

function seedSite( site = SITE ) {
	queryClient.setQueryData( sitesQuery.queryKey, [ site ] );
	queryClient.setQueryData( bigSkyPluginQuery( site.ID ).queryKey, {
		blog_id: site.ID,
		enabled: true,
		available: true,
		on_free_trial: false,
	} );
}

function seedQueries( postByEmailAddress?: string, site = SITE ) {
	seedSite( site );
	queryClient.setQueryData( sitePostByEmailSettingsQuery( site ).queryKey, {
		post_by_email_address: postByEmailAddress,
	} );
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: {
			retry: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
		},
		mutations: { retry: false },
	} );
	Object.defineProperty( window.navigator, 'clipboard', {
		value: { writeText: jest.fn().mockResolvedValue( undefined ) },
		configurable: true,
	} );
} );

describe( '<WordPressAgentEmail />', () => {
	test( 'shows the selected site and its connected email address', async () => {
		seedQueries( 'secret@post.wordpress.com' );

		const { recordTracksEvent } = render( <WordPressAgentEmail />, { queryClient } );

		expect( screen.getByRole( 'heading', { name: 'Email' } ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'Select site' } ) ).toHaveValue(
			'email-agent.wordpress.com'
		);
		expect( screen.getByLabelText( 'Agent email' ) ).toHaveValue(
			'agent+secret@post.wordpress.com'
		);
		expect(
			screen.getByText( 'test@example.com', { selector: 'strong' } ).parentElement
		).toHaveTextContent( 'Your agent only replies to test@example.com.' );

		const addToContacts = screen.getByRole( 'link', { name: 'Add to contacts' } );
		expect( addToContacts ).toHaveAttribute( 'download', 'email-agent.wordpress.com.vcf' );
		expect( decodeURIComponent( addToContacts.getAttribute( 'href' ) ?? '' ) ).toContain(
			'EMAIL;TYPE=INTERNET:agent+secret@post.wordpress.com'
		);

		addToContacts.addEventListener( 'click', ( event ) => event.preventDefault() );
		await userEvent.click( addToContacts );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_wordpress_agent_email_vcard_downloaded',
			{ site_id: SITE.ID }
		);
		expect( screen.queryByRole( 'link', { name: 'Manage' } ) ).not.toBeInTheDocument();
	} );

	test( 'explains when email is unavailable and links to plans', () => {
		seedSite();
		queryClient.setQueryData( bigSkyPluginQuery( SITE.ID ).queryKey, {
			blog_id: SITE.ID,
			enabled: false,
			available: false,
			on_free_trial: false,
		} );

		render( <WordPressAgentEmail />, { queryClient } );

		expect(
			screen.getByRole( 'heading', {
				name: 'Agent email isn’t available on this site’s current plan.',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'View plans' } ) ).toBeVisible();
	} );

	test( 'enables email for the selected site', async () => {
		seedQueries();
		const createRequest = nock( API )
			.post( `/wpcom/v2/sites/${ SITE.ID }/post-by-email` )
			.reply( 200, { is_enabled: true, email: 'new-secret@post.wordpress.com' } );

		const { recordTracksEvent } = render( <WordPressAgentEmail />, { queryClient } );

		expect(
			screen.getByRole( 'heading', { name: 'Turn on the email address for this site’s AI agent.' } )
		).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Enable email' } ) );

		await waitFor( () => expect( createRequest.isDone() ).toBe( true ) );
		expect( await screen.findByLabelText( 'Agent email' ) ).toHaveValue(
			'agent+new-secret@post.wordpress.com'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_wordpress_agent_email_enabled', {
			site_id: SITE.ID,
		} );
	} );

	test( 'loads an Atomic site connection from Jetpack settings', async () => {
		seedSite( ATOMIC_SITE );
		const statusRequest = nock( API )
			.get( `/rest/v1.1/jetpack-blogs/${ ATOMIC_SITE.ID }/rest-api/` )
			.query( true )
			.reply( 200, {
				data: { post_by_email_address: 'atomic-secret@post.wordpress.com' },
			} );

		render( <WordPressAgentEmail />, { queryClient } );

		await waitFor( () => expect( statusRequest.isDone() ).toBe( true ) );
		expect( await screen.findByLabelText( 'Agent email' ) ).toHaveValue(
			'agent+atomic-secret@post.wordpress.com'
		);
	} );

	test( 'loads an external Jetpack site connection from Jetpack settings', async () => {
		seedSite( JETPACK_SITE );
		const settingsRequest = nock( API )
			.get( `/rest/v1.1/jetpack-blogs/${ JETPACK_SITE.ID }/rest-api/` )
			.query( true )
			.reply( 200, {
				data: { post_by_email_address: 'jetpack-secret@post.wordpress.com' },
			} );

		render( <WordPressAgentEmail />, { queryClient } );

		await waitFor( () => expect( settingsRequest.isDone() ).toBe( true ) );
		expect( await screen.findByLabelText( 'Agent email' ) ).toHaveValue(
			'agent+jetpack-secret@post.wordpress.com'
		);
	} );
} );
