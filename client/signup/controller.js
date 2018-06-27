/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
import { sectionify } from 'lib/route';
import analytics from 'lib/analytics';
import SignupComponent from './main';
import {
	getStepUrl,
	canResumeFlow,
	getFlowName,
	getLocale,
	getStepName,
	getStepSectionName,
	getValidPath,
} from './utils';
import userModule from 'lib/user';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
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
		if ( user.get() && getLocale( context.params ) ) {
			const flowName = getFlowName( context.params ),
				stepName = getStepName( context.params ),
				stepSectionName = getStepSectionName( context.params );
			let urlWithoutLocale = getStepUrl( flowName, stepName, stepSectionName );

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
		const flowName = getFlowName( context.params );
		const localeFromParams = getLocale( context.params );
		const localeFromStore = store.get( 'signup-locale' );

		// if flow can be resumed, use saved locale
		if (
			! user.get() &&
			! localeFromParams &&
			localeFromStore &&
			canResumeFlow( flowName, SignupProgressStore.get() )
		) {
			window.location =
				getStepUrl(
					flowName,
					getStepName( context.params ),
					getStepSectionName( context.params ),
					localeFromStore
				) +
				( context.querystring ? '?' + context.querystring : '' ) +
				( context.hashstring ? '#' + context.hashstring : '' );
			return;
		}

		if ( context.pathname !== getValidPath( context.params ) ) {
			return page.redirect(
				getValidPath( context.params ) + ( context.querystring ? '?' + context.querystring : '' )
			);
		}

		store.set( 'signup-locale', localeFromParams );

		next();
	},

	start( context, next ) {
		const basePath = sectionify( context.path ),
			flowName = getFlowName( context.params ),
			stepName = getStepName( context.params ),
			stepSectionName = getStepSectionName( context.params );

		const { query } = initialContext;

		analytics.pageView.record(
			basePath,
			basePageTitle + ' > Start > ' + flowName + ' > ' + stepName
		);

		context.store.dispatch( setLayoutFocus( 'content' ) );

		context.primary = React.createElement( SignupComponent, {
			path: context.path,
			initialContext,
			locale: getLocale( context.params ),
			flowName: flowName,
			queryObject: query,
			refParameter: query && query.ref,
			stepName: stepName,
			stepSectionName: stepSectionName,
		} );
		next();
	},
};
