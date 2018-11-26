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
import SignupActions from 'lib/signup/actions';
import { isValidLandingPageVertical } from 'lib/signup/verticals';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { setSurvey } from 'state/signup/steps/survey/actions';
import { setSiteType } from 'state/signup/steps/site-type/actions';
import { setSiteTopic } from 'state/signup/steps/site-topic/actions';

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
	initSignupDataStore( context, next ) {
		if ( ! SignupProgressStore.getReduxStore() ) {
			SignupProgressStore.setReduxStore( context.store );
		}

		next();
	},

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

	submitQueryDependencies( context, next ) {
		const { query } = initialContext;

		if ( ! query ) {
			return next();
		}

		const { site_type: siteType, vertical } = query;

		const reduxStore = context.store;

		// `vertical` query parameter
		if ( vertical ) {
			reduxStore.dispatch(
				setSurvey( {
					vertical,
					otherText: '',
				} )
			);

			SignupActions.submitSignupStep( { stepName: 'survey' }, [], {
				surveySiteType: 'blog',
				surveyQuestion: vertical,
			} );
			reduxStore.dispatch( setSiteTopic( vertical ) );

			SignupActions.submitSignupStep( { stepName: 'site-topic' }, [], {
				siteTopic: vertical,
			} );

			// Track our landing page verticals
			if ( isValidLandingPageVertical( vertical ) ) {
				analytics.tracks.recordEvent( 'calypso_signup_vertical_landing_page', {
					vertical,
					flow: this.props.flowName,
				} );
			}
		}

		// `site_type` query parameter
		const siteTypeValue = getSiteTypePropertyValue( 'slug', siteType, 'slug' );
		if ( siteTypeValue ) {
			// this seems very wrong. Shouldn't it be as comprehensive as
			// https://github.com/Automattic/wp-calypso/blob/master/client/signup/steps/site-type/index.jsx#L126 ?
			reduxStore.dispatch( setSiteType( siteTypeValue ) );
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

	redirectToVerticalOnboardingFlow( context, next ) {
		const { query } = initialContext;

		if ( ! query ) {
			return next();
		}

		if ( query.vertical ) {
			const stepName = getStepName( context.params ),
				stepSectionName = getStepSectionName( context.params );

			return page.redirect( getStepUrl( 'vertical-onboarding', stepName, stepSectionName ) );
		}

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
