/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';
import route from 'lib/route';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PeopleList from './main';
import EditTeamMember from './edit-team-member-form';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import PeopleLogStore from 'lib/people/log-store';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import InvitePeople from './invite-people';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';
import config from 'config';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

export default {
	redirectToTeam,

	enforceSiteEnding( context, next ) {
		const siteId = route.getSiteFragment( context.path );

		if ( ! siteId ) {
			redirectToTeam( context );
		}

		next();
	},

	people( filter, context ) {
		renderPeopleList( filter, context );
	},

	invitePeople( context ) {
		renderInvitePeople( context );
	},

	person( context ) {
		renderSingleTeamMember( context );
	}
};

function redirectToTeam( context ) {
	if ( context ) {
		// if we are redirecting we need to retain our intended layout-focus
		const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
	}
	page.redirect( '/people/team' );
}

function renderPeopleList( filter, context ) {
	context.store.dispatch( setTitle( i18n.translate( 'People', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

	renderWithReduxStore(
		React.createElement( PeopleList, {
			peopleLog: PeopleLogStore,
			filter: filter,
			search: context.query.s
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
	analytics.pageView.record( 'people/' + filter + '/:site', 'People > ' + titlecase( filter ) );
}

function renderInvitePeople( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isJetpack = isJetpackSite( state, siteId );

	if ( isJetpack && ! config.isEnabled( 'jetpack/invites' ) ) {
		const currentLayoutFocus = getCurrentLayoutFocus( state );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
		page.redirect( '/people/team/' + siteSlug );
		analytics.tracks.recordEvent( 'calypso_invite_people_controller_redirect_to_team' );
	}

	context.store.dispatch( setTitle( i18n.translate( 'Invite People', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

	renderWithReduxStore(
		React.createElement( InvitePeople, {
			site: site
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderSingleTeamMember( context ) {
	context.store.dispatch( setTitle( i18n.translate( 'View Team Member', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

	renderWithReduxStore(
		React.createElement( EditTeamMember, {
			userLogin: context.params.user_login,
			prevPath: context.prevPath
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}
