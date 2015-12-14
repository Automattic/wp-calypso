/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import qs from 'qs';
import isEmpty from 'lodash/lang/isEmpty';

/**
 * Internal Dependencies
 */
import i18n from 'lib/mixins/i18n';
import config from 'config';
import route from 'lib/route';
import analytics from 'analytics';
import layoutFocus from 'lib/layout-focus';
import SignupComponent from './main';
import utils from './utils';
import userModule from 'lib/user';
import titleActions from 'lib/screen-title/actions';
const user = userModule();

/**
 * Constants
 */
const basePageTitle = 'Signup'; // used for analytics, doesn't require translation

/**
 * Module variables
 */
let refParameter, queryObject;

export default {
	redirectWithoutLocaleIfLoggedIn( context, next ) {
		if ( user.get() && utils.getLocale( context.params ) ) {
			const flowName = utils.getFlowName( context.params ),
				stepName = utils.getStepName( context.params ),
				stepSectionName = utils.getStepSectionName( context.params ),
				urlWithoutLocale = utils.getStepUrl( flowName, stepName, stepSectionName );

			if ( config( 'wpcom_user_bootstrap' ) ) {
				return page.redirect( urlWithoutLocale );
			}

			window.location = urlWithoutLocale + '?' + qs.stringify( context.query );
			return;
		}

		next();
	},

	saveRefParameter( context, next ) {
		if ( context.query.ref ) {
			refParameter = context.query.ref;
		}

		next();
	},

	saveQueryObject( context, next ) {
		if ( ! isEmpty( context.query ) ) {
			queryObject = context.query;
		}

		next();
	},

	redirectToFlow( context, next ) {
		if ( context.path !== utils.getValidPath( context.params ) ) {
			return page.redirect( utils.getValidPath( context.params ) );
		}

		next();
	},

	start( context ) {
		var basePath = route.sectionify( context.path ),
			flowName = utils.getFlowName( context.params ),
			stepName = utils.getStepName( context.params ),
			stepSectionName = utils.getStepSectionName( context.params );

		analytics.pageView.record( basePath, basePageTitle + ' > Start > ' + flowName + ' > ' + stepName );

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		layoutFocus.set( 'content' );

		titleActions.setTitle( i18n.translate( 'Create an account' ) );

		context.layout.setState( {
			section: 'signup',
			noSidebar: true
		} );

		ReactDom.render(
			React.createElement( SignupComponent, {
				path: context.path,
				refParameter,
				queryObject,
				locale: utils.getLocale( context.params ),
				flowName: flowName,
				stepName: stepName,
				stepSectionName: stepSectionName
			} ),
			document.getElementById( 'primary' )
		);
	},

	phoneSignup( context ) {
		var PhoneSignupComponent = require( 'signup/phone-signup-form' ),
			countriesList = require( 'lib/countries-list' ).forSms(),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, basePageTitle + ' > Phone' );

		titleActions.setTitle( i18n.translate( 'Create an account' ) );

		ReactDom.render(
			React.createElement( PhoneSignupComponent, {
				path: context.path,
				countriesList: countriesList,
				locale: context.params.lang
			} ),
			document.getElementById( 'primary' )
		);
	},

	login( context ) {
		var LogInComponent = require( 'signup/log-in-form' ),
			basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, basePageTitle + ' > Log-in' );

		titleActions.setTitle( i18n.translate( 'Log in to your WordPress.com account' ) );

		ReactDom.render(
			React.createElement( LogInComponent, {
				path: context.path,
				locale: context.params.lang
			} ),
			document.getElementById( 'primary' )
		);
	}
};
