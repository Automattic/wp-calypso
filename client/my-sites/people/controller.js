/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import route from 'client/lib/route';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PeopleList from './main';
import EditTeamMember from './edit-team-member-form';
import analytics from 'client/lib/analytics';
import titlecase from 'to-title-case';
import PeopleLogStore from 'client/lib/people/log-store';
import { setDocumentHeadTitle as setTitle } from 'client/state/document-head/actions';
import InvitePeople from './invite-people';
import { getCurrentLayoutFocus } from 'client/state/ui/layout-focus/selectors';
import { setNextLayoutFocus } from 'client/state/ui/layout-focus/actions';
import { getSelectedSite } from 'client/state/ui/selectors';

export default {
	redirectToTeam,

	enforceSiteEnding( context, next ) {
		const siteId = route.getSiteFragment( context.path );

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
		peopleLog: PeopleLogStore,
		filter: filter,
		search: context.query.s,
	} );
	analytics.pageView.record( 'people/' + filter + '/:site', 'People > ' + titlecase( filter ) );
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

function renderSingleTeamMember( context, next ) {
	context.store.dispatch( setTitle( i18n.translate( 'View Team Member', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

	context.primary = React.createElement( EditTeamMember, {
		userLogin: context.params.user_login,
		prevPath: context.prevPath,
	} );
	next();
}
