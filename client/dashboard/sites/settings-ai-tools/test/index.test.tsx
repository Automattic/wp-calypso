/**
 * @jest-environment jsdom
 */

import {
	bigSkyPluginQuery,
	queryClient,
	siteBySlugQuery,
	sitePostByEmailSettingsQuery,
	userSettingsQuery,
} from '@automattic/api-queries';
import { disable, enable } from '@automattic/calypso-config';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AIToolsSettings, { getAgentEmailAddress, getAgentEmailVCard } from '../index';
import type { Site, UserSettings } from '@automattic/api-core';

const site = {
	ID: 123,
	slug: 'email-assistant.wordpress.com',
	name: 'Email Assistant',
	title: 'Email Assistant',
	is_wpcom_atomic: true,
	options: {
		admin_url: 'https://email-assistant.wordpress.com/wp-admin/',
	},
} as unknown as Site;

const simpleSite = {
	...site,
	ID: 456,
	slug: 'simple-email-assistant.wordpress.com',
	is_wpcom_atomic: false,
	jetpack: false,
} as Site;

let clipboardWriteText: jest.Mock;

beforeAll( () => {
	enable( 'dolly/telegram' );
} );

afterAll( () => {
	disable( 'dolly/telegram' );
} );

function seedQueries( postByEmailAddress = '', seedPostByEmailSettings = true, activeSite = site ) {
	queryClient.setQueryData( siteBySlugQuery( activeSite.slug ).queryKey, activeSite );
	queryClient.setQueryData( bigSkyPluginQuery( activeSite.ID ).queryKey, {
		blog_id: activeSite.ID,
		enabled: false,
		available: true,
		on_free_trial: false,
	} );
	queryClient.setQueryData( userSettingsQuery().queryKey, {
		mcp_abilities: {},
	} as UserSettings );
	if ( seedPostByEmailSettings ) {
		queryClient.setQueryData( sitePostByEmailSettingsQuery( activeSite ).queryKey, {
			post_by_email_address: postByEmailAddress,
		} );
	}
}

function mockJetpackPostByEmailMutation(
	action: string,
	postByEmailAddress?: string,
	activeSite = site
) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.1/jetpack-blogs/${ activeSite.ID }/rest-api/`, ( body ) => {
			expect( body.path ).toBe( '/jetpack/v4/settings/' );
			expect( body.json ).toBe( true );
			expect( JSON.parse( body.body ) ).toEqual( {
				post_by_email_address: action,
			} );
			return true;
		} )
		.query( true )
		.reply( 200, {
			post_by_email_address: postByEmailAddress ?? 'noop',
		} );
}

function mockWpcomPostByEmailMutation(
	action: 'create' | 'regenerate' | 'delete',
	postByEmailAddress?: string,
	activeSite = simpleSite
) {
	const path = `/wpcom/v2/sites/${ activeSite.ID }/post-by-email`;
	const scope = nock( 'https://public-api.wordpress.com' );

	if ( action === 'create' ) {
		return scope.post( path ).reply( 200, {
			is_enabled: true,
			email: postByEmailAddress,
		} );
	}

	if ( action === 'regenerate' ) {
		return scope.put( path ).reply( 200, {
			email: postByEmailAddress,
		} );
	}

	return scope.delete( path ).reply( 200 );
}

function mockWpcomPostByEmailStatus( activeSite = simpleSite ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ activeSite.ID }/post-by-email` )
		.reply( 200, {
			is_enabled: false,
		} );
}

function mockJetpackPostByEmailSettingsFailure() {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/jetpack-blogs/${ site.ID }/rest-api/` )
		.query( true )
		.reply( 404, {
			message: 'No route was found matching the URL and request method.',
		} );
}

function renderAIToolsSettings(
	postByEmailAddress = '',
	seedPostByEmailSettings = true,
	activeSite = site
) {
	seedQueries( postByEmailAddress, seedPostByEmailSettings, activeSite );

	return render( <AIToolsSettings siteSlug={ activeSite.slug } />, { queryClient } );
}

function mockClipboard() {
	Object.defineProperty( window.navigator, 'clipboard', {
		value: {
			writeText: clipboardWriteText,
		},
		configurable: true,
	} );
}

beforeEach( () => {
	clipboardWriteText = jest.fn().mockResolvedValue( undefined );
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: {
			retry: false,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			staleTime: Infinity,
		},
		mutations: {
			retry: false,
		},
	} );
	mockClipboard();
} );

describe( 'getAgentEmailAddress', () => {
	test.each( [ '', 'NULL', 'noop', 'not-an-email' ] )(
		'returns null for an unusable Post by Email value: %s',
		( postByEmailAddress ) => {
			expect( getAgentEmailAddress( postByEmailAddress ) ).toBeNull();
		}
	);

	test( 'adds the agent prefix to a Post by Email address', () => {
		expect( getAgentEmailAddress( 'secret@post.wordpress.com' ) ).toBe(
			'agent+secret@post.wordpress.com'
		);
	} );

	test( 'does not double-prefix an agent address', () => {
		expect( getAgentEmailAddress( 'agent+secret@post.wordpress.com' ) ).toBe(
			'agent+secret@post.wordpress.com'
		);
	} );
} );

describe( 'getAgentEmailVCard', () => {
	test( 'generates a contact card named after the site domain', () => {
		expect(
			getAgentEmailVCard( 'email-assistant.wordpress.com', 'agent+secret@post.wordpress.com' )
		).toBe(
			[
				'BEGIN:VCARD',
				'VERSION:3.0',
				'FN:email-assistant.wordpress.com',
				'N:email-assistant.wordpress.com;;;;',
				'EMAIL;TYPE=INTERNET:agent+secret@post.wordpress.com',
				'END:VCARD',
				'',
			].join( '\r\n' )
		);
	} );
} );

describe( '<AIToolsSettings>', () => {
	test( 'enables, copies, regenerates, and disables the WordPress Agent email address', async () => {
		const user = userEvent.setup();
		mockClipboard();
		renderAIToolsSettings();

		expect( screen.getByRole( 'heading', { name: 'Email WordPress Agent' } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Connect Telegram/ } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/me/developer'
		);
		expect(
			screen.getByText(
				'Connect your WordPress.com account to Telegram. This connection is shared across multiple sites.'
			)
		).toBeVisible();
		expect(
			screen.getByText(
				'Enabling this also enables Post by Email. Disabling it deletes the Post by Email address, so both Post by Email and this WordPress Agent address will stop working.'
			)
		).toBeVisible();

		const toggle = screen.getByRole( 'checkbox', {
			name: 'Enable WordPress Agent email address',
		} );
		expect( toggle ).not.toBeChecked();
		expect( screen.queryByLabelText( 'WordPress Agent email address' ) ).not.toBeInTheDocument();

		const createScope = mockJetpackPostByEmailMutation(
			'create',
			'first-secret@post.wordpress.com'
		);
		await user.click( toggle );

		await waitFor( () => {
			expect( createScope.isDone() ).toBe( true );
		} );

		const addressInput = await screen.findByLabelText( 'WordPress Agent email address' );
		expect( addressInput ).toHaveValue( 'agent+first-secret@post.wordpress.com' );
		expect( toggle ).toBeChecked();

		const addToContactsLink = screen.getByRole( 'link', { name: 'Add to contacts' } );
		expect( addToContactsLink ).toHaveAttribute( 'download', 'email-assistant.wordpress.com.vcf' );
		expect(
			decodeURIComponent(
				addToContactsLink.getAttribute( 'href' )?.replace( 'data:text/vcard;charset=utf-8,', '' ) ??
					''
			)
		).toContain( 'FN:email-assistant.wordpress.com\r\n' );
		expect(
			decodeURIComponent(
				addToContactsLink.getAttribute( 'href' )?.replace( 'data:text/vcard;charset=utf-8,', '' ) ??
					''
			)
		).toContain( 'EMAIL;TYPE=INTERNET:agent+first-secret@post.wordpress.com' );

		await user.click(
			screen.getByRole( 'button', { name: 'Copy WordPress Agent email address' } )
		);
		expect( clipboardWriteText ).toHaveBeenCalledWith( 'agent+first-secret@post.wordpress.com' );

		const regenerateScope = mockJetpackPostByEmailMutation(
			'regenerate',
			'second-secret@post.wordpress.com'
		);
		await user.click( screen.getByRole( 'button', { name: 'Regenerate address' } ) );

		await waitFor( () => {
			expect( regenerateScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( screen.getByLabelText( 'WordPress Agent email address' ) ).toHaveValue(
				'agent+second-secret@post.wordpress.com'
			);
		} );

		const deleteScope = mockJetpackPostByEmailMutation( 'delete' );
		await user.click( toggle );

		await waitFor( () => {
			expect( deleteScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( toggle ).not.toBeChecked();
			expect( screen.queryByLabelText( 'WordPress Agent email address' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'uses the WordPress.com Post by Email endpoint for simple sites', async () => {
		const user = userEvent.setup();
		renderAIToolsSettings( '', true, simpleSite );

		const toggle = screen.getByRole( 'checkbox', {
			name: 'Enable WordPress Agent email address',
		} );

		const createScope = mockWpcomPostByEmailMutation(
			'create',
			'simple-secret@post.wordpress.com'
		);
		await user.click( toggle );

		await waitFor( () => {
			expect( createScope.isDone() ).toBe( true );
		} );
		expect( await screen.findByLabelText( 'WordPress Agent email address' ) ).toHaveValue(
			'agent+simple-secret@post.wordpress.com'
		);

		const regenerateScope = mockWpcomPostByEmailMutation(
			'regenerate',
			'new-simple-secret@post.wordpress.com'
		);
		await user.click( screen.getByRole( 'button', { name: 'Regenerate address' } ) );

		await waitFor( () => {
			expect( regenerateScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( screen.getByLabelText( 'WordPress Agent email address' ) ).toHaveValue(
				'agent+new-simple-secret@post.wordpress.com'
			);
		} );

		const deleteScope = mockWpcomPostByEmailMutation( 'delete' );
		await user.click( toggle );

		await waitFor( () => {
			expect( deleteScope.isDone() ).toBe( true );
		} );
		await waitFor( () => {
			expect( screen.queryByLabelText( 'WordPress Agent email address' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'loads simple site Post by Email status from the WordPress.com endpoint', async () => {
		const settingsScope = mockWpcomPostByEmailStatus();

		renderAIToolsSettings( '', false, simpleSite );

		await waitFor( () => {
			expect( settingsScope.isDone() ).toBe( true );
		} );
		expect(
			screen.getByRole( 'checkbox', {
				name: 'Enable WordPress Agent email address',
			} )
		).not.toBeChecked();
	} );

	test( 'does not fail the page when Jetpack settings are unavailable', async () => {
		const settingsScope = mockJetpackPostByEmailSettingsFailure();

		renderAIToolsSettings( '', false );

		expect( screen.getByRole( 'heading', { name: 'Email WordPress Agent' } ) ).toBeVisible();
		await waitFor( () => {
			expect( settingsScope.isDone() ).toBe( true );
		} );
		expect(
			screen.getByRole( 'checkbox', {
				name: 'Enable WordPress Agent email address',
			} )
		).not.toBeChecked();
	} );
} );
