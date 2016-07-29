/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';
import route from 'lib/route';
import get from 'lodash/get';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import sitesList from 'lib/sites-list';
import PeopleList from './main';
import EditTeamMember from './edit-team-member-form';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';
import UsersStore from 'lib/users/store';
import UsersActions from 'lib/users/actions';
import PeopleLogStore from 'lib/people/log-store';
import titleActions from 'lib/screen-title/actions';
import InvitePeople from './invite-people';
import { renderWithReduxStore } from 'lib/react-helpers';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';

/**
 * Module variables
 */
const sites = sitesList();

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
	titleActions.setTitle( i18n.translate( 'People', { textOnly: true } ), { siteID: route.getSiteFragment( context.path ) } );

	renderWithReduxStore(
		React.createElement( PeopleList, {
			sites: sites,
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
	const site = sites.getSelectedSite();
	const isJetpack = get( site, 'jetpack' );

	if ( ! sites.initialized ) {
		sites.once( 'change', () => page( context.path ) );
	}

	if ( isJetpack ) {
		const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
		page.redirect( '/people/team/' + site.slug );
		analytics.tracks.recordEvent( 'calypso_invite_people_controller_redirect_to_team' );
	}

	titleActions.setTitle( i18n.translate( 'Invite People', { textOnly: true } ), { siteID: route.getSiteFragment( context.path ) } );

	renderWithReduxStore(
		React.createElement( InvitePeople, {
			site: site
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}

function renderSingleTeamMember( context ) {
	let site,
		siteId,
		user,
		userLogin = context.params.user_login;

	if ( ! sites.initialized ) {
		sites.once( 'change', () => page( context.path ) );
	}

	site = sites.getSelectedSite();
	siteId = site && site.ID ? site.ID : 0;

	titleActions.setTitle( i18n.translate( 'View Team Member', { textOnly: true } ), { siteID: route.getSiteFragment( context.path ) } );

	if ( siteId && 0 !== siteId ) {
		user = UsersStore.getUserByLogin( siteId, userLogin );

		if ( ! user ) {
			UsersActions.fetchUser( { siteId: siteId }, userLogin );
			PeopleLogStore.once( 'change', function() {
				let fetchUserError = PeopleLogStore.getErrors(
					log => siteId === log.siteId && 'RECEIVE_USER_FAILED' === log.action && userLogin === log.user
				);
				if ( fetchUserError.length ) {
					const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
					context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
					page.redirect( '/people/team/' + site.slug );
				}
			} );
		} else {
			analytics.pageView.record( 'people/edit/:user_login/:site', 'View Team Member' );
		}
	}

	renderWithReduxStore(
		React.createElement( EditTeamMember, {
			siteSlug: site && site.slug ? site.slug : undefined,
			siteId: site && site.ID ? site.ID : undefined,
			isJetpack: site && site.jetpack,
			isMultisite: site && site.is_multisite,
			userLogin: userLogin,
			prevPath: context.prevPath
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}
