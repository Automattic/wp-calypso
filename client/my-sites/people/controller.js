/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import route from 'lib/route';

/**
 * Internal Dependencies
 */
import i18n from 'lib/mixins/i18n';
import sitesList from 'lib/sites-list';
import PeopleList from './main';
import EditTeamMember from './edit-team-member-form';
import qs from 'querystring';
import layoutFocus from 'lib/layout-focus';
import analytics from 'analytics';
import titlecase from 'to-title-case';
import UsersStore from 'lib/users/store';
import UsersActions from 'lib/users/actions';
import PeopleLogStore from 'lib/people/log-store';
import titleActions from 'lib/screen-title/actions';

/**
 * Module variables
 */
const sites = sitesList();

export default {
	redirectToTeam() {
		// if we are redirecting we need to retain our intended layout-focus
		layoutFocus.setNext( layoutFocus.getCurrent() );
		page.redirect( '/people/team' );
	},

	enforceSiteEnding( context, next ) {
		let siteId = route.getSiteFragment( context.path );

		if ( ! siteId ) {
			this.redirectToTeam();
		}

		next();
	},

	people( filter, context ) {
		renderPeopleList( filter, context );
	},

	person( context ) {
		renderSingleTeamMember( context );
	}
};

function renderPeopleList( filter, context ) {
	titleActions.setTitle( i18n.translate( 'People', { textOnly: true } ), { siteID: route.getSiteFragment( context.path ) } );

	ReactDom.render(
		React.createElement( PeopleList, {
			sites: sites,
			peopleLog: PeopleLogStore,
			filter: filter,
			search: qs.parse( context.querystring ).s
		} ),
		document.getElementById( 'primary' )
	);
	analytics.pageView.record( 'people/' + filter + '/:site', 'People > ' + titlecase( filter ) );
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
					layoutFocus.setNext( layoutFocus.getCurrent() );
					page.redirect( '/people/team/' + site.slug );
				}
			} );
		} else {
			analytics.pageView.record( 'people/edit/:user_login/:site', 'View Team Member' );
		}
	}

	ReactDom.render(
		React.createElement( EditTeamMember, {
			siteSlug: site && site.slug ? site.slug : undefined,
			siteId: site && site.ID ? site.ID : undefined,
			isJetpack: site && site.jetpack,
			isMultisite: site && site.is_multisite,
			userLogin: userLogin,
			prevPath: context.prevPath
		} ),
		document.getElementById( 'primary' )
	);
}
