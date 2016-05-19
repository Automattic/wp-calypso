/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import page from 'page';
import Debug from 'debug';

/**
 * Internal Dependencies
 */
import JetpackConnect from './index';
import jetpackConnectAuthorizeForm from './authorize-form';
import { setSection } from 'state/ui/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import {
	JETPACK_CONNECT_QUERY_SET,
	JETPACK_CONNECT_QUERY_UPDATE,
	JETPACK_CONNECT_SSO_QUERY_SET
} from 'state/action-types';
import userFactory from 'lib/user';
import jetpackSSOForm from './sso';
import i18nUtils from 'lib/i18n-utils';
import analytics from 'lib/analytics';
import config from 'config';
import i18n from 'lib/mixins/i18n';
import plansFactory from 'lib/plans-list';
import route from 'lib/route';
import sitesFactory from 'lib/sites-list';
import titleActions from 'lib/screen-title/actions';

const plans = plansFactory();
const sites = sitesFactory();

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const userModule = userFactory();

export default {
	redirectWithoutLocaleifLoggedIn( context, next ) {
		if ( userModule.get() && i18nUtils.getLocaleFromPath( context.path ) ) {
			let urlWithoutLocale = i18nUtils.removeLocaleFromPath( context.path );
			return page.redirect( urlWithoutLocale );
		}

		next();
	},

	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) && context.query.redirect_uri ) {
			debug( 'set initial query object', context.query );
			context.store.dispatch( { type: JETPACK_CONNECT_QUERY_SET, queryObject: context.query } );
			page.redirect( context.pathname );
		}

		if ( ! isEmpty( context.query ) && context.query.update_nonce ) {
			debug( 'updating nonce', context.query );
			context.store.dispatch( { type: JETPACK_CONNECT_QUERY_UPDATE, property: '_wp_nonce', value: context.query.update_nonce } );
			page.redirect( context.pathname );
		}

		if ( ! isEmpty( context.query ) && context.query.sso_nonce && context.query.site_id ) {
			debug( 'updating SSO query', context.query );
			context.store.dispatch( { type: JETPACK_CONNECT_SSO_QUERY_SET, queryObject: context.query } );
			page.redirect( context.pathname );
		}

		next();
	},

	connect( context ) {
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		renderWithReduxStore(
			React.createElement( JetpackConnect, {
				path: context.path,
				context: context,
				locale: context.params.locale,
				userModule: userModule
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	authorizeForm( context ) {
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		userModule.fetch();

		renderWithReduxStore(
			React.createElement( jetpackConnectAuthorizeForm, {
				path: context.path,
				locale: context.params.locale,
				userModule: userModule
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	sso( context ) {
		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		context.store.dispatch( setSection( 'jetpackConnect', {
			hasSidebar: false
		} ) );

		userModule.fetch();

		renderWithReduxStore(
			React.createElement( jetpackSSOForm, {
				path: context.path,
				locale: context.params.lang,
				userModule: userModule
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	plansLanding( context ) {
		const Plans = require( './plans' ),
			CheckoutData = require( 'components/data/checkout' ),
			site = sites.getSelectedSite(),
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path ),
			analyticsBasePath = basePath + '/:site';

		if ( ! site || ! site.jetpack || ! config.isEnabled( 'jetpack/connect' ) ) {
			return;
		}

		titleActions.setTitle( i18n.translate( 'Plans', { textOnly: true } ),
			{ siteID: route.getSiteFragment( context.path ) }
		);

		analytics.tracks.recordEvent( 'calypso_plans_view' );
		analytics.pageView.record( analyticsBasePath, analyticsPageTitle );

		renderWithReduxStore(
			<CheckoutData>
				<Plans
					sites={ sites }
					plans={ plans }
					context={ context }
					destinationType={ context.params.destinationType } />
			</CheckoutData>,
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
