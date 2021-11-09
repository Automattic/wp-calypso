import i18n from 'i18n-calypso';
import page from 'page';
import { createElement } from 'react';
import { getSiteFragment } from 'calypso/lib/route';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import EditTeamMember from './edit-team-member-form';
import InvitePeople from './invite-people';
import PeopleList from './main';
import PeopleInviteDetails from './people-invite-details';
import PeopleInvites from './people-invites';

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

	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Users', { textOnly: true } ) ) );

	context.primary = createElement( PeopleList, {
		filter: filter,
		search: context.query.s,
	} );
	next();
}

function renderInvitePeople( context, next ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	context.store.dispatch( setTitle( i18n.translate( 'Invite People', { textOnly: true } ) ) ); // FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.

	context.primary = createElement( InvitePeople, {
		site: site,
	} );
	next();
}

function renderPeopleInvites( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'Invites', { textOnly: true } ) ) );

	context.primary = createElement( PeopleInvites );
	next();
}

function renderPeopleInviteDetails( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'Invite Details', { textOnly: true } ) ) );

	context.primary = createElement( PeopleInviteDetails, {
		inviteKey: context.params.invite_key,
	} );
	next();
}

function renderSingleTeamMember( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'View Team Member', { textOnly: true } ) ) ); // FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.

	context.primary = createElement( EditTeamMember, {
		userLogin: context.params.user_login,
	} );
	next();
}
