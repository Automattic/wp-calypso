/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import page from 'page';
import qs from 'qs';
import isEmpty from 'lodash/isEmpty';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import route from 'lib/route';
import analytics from 'lib/analytics';
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

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( SignupComponent, {
					path: context.path,
					refParameter,
					queryObject,
					locale: utils.getLocale( context.params ),
					flowName: flowName,
					stepName: stepName,
					stepSectionName: stepSectionName
				} )
			),
			document.getElementById( 'primary' )
		);
	}
};
