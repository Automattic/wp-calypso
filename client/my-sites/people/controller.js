/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PeopleList from './main';
import EditTeamMember from './edit-team-member-form';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import InvitePeople from './invite-people';
import PeopleInvites from './people-invites';
import PeopleInviteDetails from './people-invite-details';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getSiteFragment } from 'calypso/lib/route';

export default {
	redirectToTeam,

	enforceSiteEnding( context, next ) {
		const siteId = getSiteFragment( context.path );

		if ( ! siteId ) {
			redirectToTeam( context );
		}

		next();
	},

	people( context, next ) {
		renderPeopleList( context, next );
	},

	invitePeople( context, next ) {
		renderInvitePeople( context, next );
	},

	person( context, next ) {
		renderSingleTeamMember( context, next );
	},

	peopleInvites( context, next ) {
		renderPeopleInvites( context, next );
	},

	peopleInviteDetails( context, next ) {
		renderPeopleInviteDetails( context, next );
	},
};

function redirectToTeam( context ) {
	if ( context ) {
		// if we are redirecting we need to retain our intended layout-focus
		const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
	}
	page.redirect( '/people/team' );
}

function renderPeopleList( context, next ) {
	const filter = context.params.filter;

	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'People', { textOnly: true } ) ) );

	context.primary = React.createElement( PeopleList, {
		filter: filter,
		search: context.query.s,
	} );
	next();
}

function renderInvitePeople( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	context.store.dispatch( setTitle( i18n.translate( 'Invite People', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

	context.primary = React.createElement( InvitePeople, {
		site: site,
	} );
	next();
}

function renderPeopleInvites( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'Invites', { textOnly: true } ) ) );

	context.primary = React.createElement( PeopleInvites );
	next();
}

function renderPeopleInviteDetails( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'Invite Details', { textOnly: true } ) ) );

	context.primary = React.createElement( PeopleInviteDetails, {
		inviteKey: context.params.invite_key,
	} );
	next();
}

function renderSingleTeamMember( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'View Team Member', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

	context.primary = React.createElement( EditTeamMember, {
		userLogin: context.params.user_login,
	} );
	next();
}
