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
import { getStepComponent } from './config/step-components';
import {
	getStepUrl,
	canResumeFlow,
	getFlowName,
	getLocale,
	getStepName,
	getStepSectionName,
	getValidPath,
	getFlowPageTitle,
} from './utils';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import store from 'store';
import { setCurrentFlowName } from 'state/signup/flow/actions';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { getSignupProgress } from 'state/signup/progress/selectors';

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
		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		if ( userLoggedIn && getLocale( context.params ) ) {
			const flowName = getFlowName( context.params );
			const stepName = getStepName( context.params );
			const stepSectionName = getStepSectionName( context.params );
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
		context.store.dispatch( setCurrentFlowName( flowName ) );

		const userLoggedIn = isUserLoggedIn( context.store.getState() );
		const signupProgress = getSignupProgress( context.store.getState() );

		// if flow can be resumed, use saved locale
		if (
			! userLoggedIn &&
			! localeFromParams &&
			localeFromStore &&
			canResumeFlow( flowName, signupProgress )
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

	async start( context, next ) {
		const basePath = sectionify( context.path );
		const flowName = getFlowName( context.params );
		const stepName = getStepName( context.params );
		const stepSectionName = getStepSectionName( context.params );

		const { query } = initialContext;

		// wait for the step component module to load
		const stepComponent = await getStepComponent( stepName );

		analytics.pageView.record(
			basePath,
			basePageTitle + ' > Start > ' + flowName + ' > ' + stepName
		);

		context.store.dispatch( setLayoutFocus( 'content' ) );
		context.store.dispatch( setCurrentFlowName( flowName ) );

		context.primary = React.createElement( SignupComponent, {
			path: context.path,
			initialContext,
			locale: getLocale( context.params ),
			flowName: flowName,
			queryObject: query,
			refParameter: query && query.ref,
			stepName,
			stepSectionName,
			stepComponent,
			pageTitle: getFlowPageTitle( flowName ),
		} );

		next();
	},
};
