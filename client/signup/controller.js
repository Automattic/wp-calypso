/** @format */

/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import page from 'page';
import { isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
import route from 'lib/route';
import analytics from 'lib/analytics';
import SignupComponent from './main';
import utils from './utils';
import userModule from 'lib/user';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { renderWithReduxStore } from 'lib/react-helpers';
import store from 'store';
import SignupProgressStore from 'lib/signup/progress-store';

const user = userModule();

/**
 * Constants
 */
const basePageTitle = 'Signup'; // used for analytics, doesn't require translation

/**
 * Module variables
 */
let initialContext;

export default {
	redirectWithoutLocaleIfLoggedIn( context, next ) {
		if ( user.get() && utils.getLocale( context.params ) ) {
			const flowName = utils.getFlowName( context.params ),
				stepName = utils.getStepName( context.params ),
				stepSectionName = utils.getStepSectionName( context.params );
			let urlWithoutLocale = utils.getStepUrl( flowName, stepName, stepSectionName );

			if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
				return page.redirect( urlWithoutLocale );
			}

			if ( ! isEmpty( context.query ) ) {
				urlWithoutLocale += '?' + context.querystring;
			}

			if ( ! isEmpty( context.hash ) ) {
				urlWithoutLocale += '#' + context.hashstring;
			}

			window.location = urlWithoutLocale;
			return;
		}

		next();
	},

	saveInitialContext( context, next ) {
		if ( ! initialContext ) {
			initialContext = Object.assign( {}, context );
		}

		next();
	},

	redirectToFlow( context, next ) {
		const flowName = utils.getFlowName( context.params );
		const localeFromParams = utils.getLocale( context.params );
		const localeFromStore = store.get( 'signup-locale' );

		// if flow can be resumed, use saved locale
		if (
			! user.get() &&
			! localeFromParams &&
			localeFromStore &&
			utils.canResumeFlow( flowName, SignupProgressStore.getFromCache() )
		) {
			window.location =
				utils.getStepUrl(
					flowName,
					utils.getStepName( context.params ),
					utils.getStepSectionName( context.params ),
					localeFromStore
				) +
				( context.querystring ? '?' + context.querystring : '' ) +
				( context.hashstring ? '#' + context.hashstring : '' );
			return;
		}

		if ( context.pathname !== utils.getValidPath( context.params ) ) {
			return page.redirect(
				utils.getValidPath( context.params ) +
					( context.querystring ? '?' + context.querystring : '' )
			);
		}

		store.set( 'signup-locale', localeFromParams );

		next();
	},

	start( context ) {
		const basePath = route.sectionify( context.path ),
			flowName = utils.getFlowName( context.params ),
			stepName = utils.getStepName( context.params ),
			stepSectionName = utils.getStepSectionName( context.params );

		analytics.pageView.record(
			basePath,
			basePageTitle + ' > Start > ' + flowName + ' > ' + stepName
		);

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		context.store.dispatch( setLayoutFocus( 'content' ) );

		renderWithReduxStore(
			React.createElement( SignupComponent, {
				path: context.path,
				initialContext,
				locale: utils.getLocale( context.params ),
				flowName: flowName,
				stepName: stepName,
				stepSectionName: stepSectionName,
			} ),
			'primary',
			context.store
		);
	},
};
