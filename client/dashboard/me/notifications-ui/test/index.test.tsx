/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import NotificationsUserInterface from '../index';
import type { UserPreferences } from '@automattic/api-core';

const mockGetPreferences = ( preferences: UserPreferences = {} ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: preferences } );

const mockSavePreferences = ( expected: UserPreferences ) =>
	nock( 'https://public-api.wordpress.com:443' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			expect( body.calypso_preferences ).toEqual( expected );
			return true;
		} )
		.reply( 200, { calypso_preferences: expected } );

const findSection = async ( name: string ) => within( await screen.findByRole( 'form', { name } ) );

const renderSection = async ( name: string ) => {
	render( <NotificationsUserInterface /> );
	return findSection( name );
};

// The movable rows carry the move buttons; the pinned two don't, so this reads the order
// the user can actually change.
const orderedViewNames = ( views: ReturnType< typeof within > ) =>
	views
		.getAllByRole( 'button', { name: /^Move .+ up$/ } )
		.map( ( button: HTMLElement ) =>
			button.getAttribute( 'aria-label' )!.replace( /^Move | up$/g, '' )
		);

describe( '<NotificationsUserInterface>', () => {
	describe( 'Panel', () => {
		test( 'defaults to Classic when no preference is set', async () => {
			mockGetPreferences();

			render( <NotificationsUserInterface /> );

			const panel = await findSection( 'Panel' );

			expect( panel.getByRole( 'radio', { name: /Classic/ } ) ).toBeChecked();
			expect( panel.getByRole( 'radio', { name: /Simplified/ } ) ).not.toBeChecked();
		} );

		test( 'reflects the saved layout style', async () => {
			mockGetPreferences( { 'notifications-layout-style': 'simplified' } );

			render( <NotificationsUserInterface /> );

			const panel = await findSection( 'Panel' );

			expect( panel.getByRole( 'radio', { name: /Simplified/ } ) ).toBeChecked();
		} );

		test( 'saves the layout style only once Save is pressed', async () => {
			mockGetPreferences();
			const scope = mockSavePreferences( { 'notifications-layout-style': 'simplified' } );

			render( <NotificationsUserInterface /> );

			const panel = await findSection( 'Panel' );

			expect( panel.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();

			await userEvent.click( panel.getByRole( 'radio', { name: /Simplified/ } ) );
			expect( scope.isDone() ).toBe( false );

			await userEvent.click( panel.getByRole( 'button', { name: 'Save' } ) );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	describe( 'Views', () => {
		test( 'lists the built-in views on and the premade views off by default', async () => {
			mockGetPreferences();

			const views = await renderSection( 'Views' );

			for ( const name of [ 'All', 'Unread', 'Comments', 'Subscribers', 'Likes' ] ) {
				expect( views.getByRole( 'checkbox', { name } ) ).toBeChecked();
			}

			for ( const name of [ 'New posts', 'Store', 'Site health', 'Billing', 'Achievements' ] ) {
				expect( views.getByRole( 'checkbox', { name } ) ).not.toBeChecked();
			}

			expect( views.getByRole( 'checkbox', { name: 'All' } ) ).toBeDisabled();
			expect( views.getByRole( 'checkbox', { name: 'Unread' } ) ).toBeDisabled();
		} );

		test( 'applies the saved order and visibility', async () => {
			mockGetPreferences( {
				'notifications-views': [ { name: 'store' }, { name: 'likes', hidden: true } ],
			} );

			const views = await renderSection( 'Views' );

			expect( views.getByRole( 'checkbox', { name: 'Store' } ) ).toBeChecked();
			expect( views.getByRole( 'checkbox', { name: 'Likes' } ) ).not.toBeChecked();
			expect( orderedViewNames( views ) ).toEqual( [
				'Store',
				'Likes',
				'Comments',
				'Subscribers',
				'New posts',
				'Site health',
				'Billing',
				'Achievements',
			] );
		} );

		test( 'cannot move the first view up or the last view down', async () => {
			mockGetPreferences();

			const views = await renderSection( 'Views' );

			expect( views.getByRole( 'button', { name: 'Move Comments up' } ) ).toBeDisabled();
			expect( views.getByRole( 'button', { name: 'Move Achievements down' } ) ).toBeDisabled();
			expect( views.getByRole( 'button', { name: 'Move Comments down' } ) ).toBeEnabled();
		} );

		test( 'saves a reordered and re-hidden list once Save is pressed', async () => {
			mockGetPreferences();
			const scope = mockSavePreferences( {
				'notifications-views': [
					{ name: 'follows', hidden: false },
					{ name: 'comments', hidden: false },
					{ name: 'likes', hidden: true },
					{ name: 'new_posts', hidden: true },
					{ name: 'store', hidden: true },
					{ name: 'site_health', hidden: true },
					{ name: 'billing', hidden: true },
					{ name: 'achievements', hidden: true },
				],
			} );

			const views = await renderSection( 'Views' );

			expect( views.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();

			await userEvent.click( views.getByRole( 'button', { name: 'Move Subscribers up' } ) );
			await userEvent.click( views.getByRole( 'checkbox', { name: 'Likes' } ) );
			expect( scope.isDone() ).toBe( false );

			await userEvent.click( views.getByRole( 'button', { name: 'Save' } ) );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );
} );
