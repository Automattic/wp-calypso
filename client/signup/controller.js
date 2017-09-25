/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import page from 'page';
import qs from 'qs';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import SignupComponent from './main';
import utils from './utils';
import config from 'config';
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import route from 'lib/route';
import userModule from 'lib/user';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

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

			if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
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
		if ( context.pathname !== utils.getValidPath( context.params ) ) {
			return page.redirect( utils.getValidPath( context.params ) + ( context.querystring ? '?' + context.querystring : '' ) );
		}

		next();
	},

	start( context ) {
		const basePath = route.sectionify( context.path ),
			flowName = utils.getFlowName( context.params ),
			stepName = utils.getStepName( context.params ),
			stepSectionName = utils.getStepSectionName( context.params );

		analytics.pageView.record( basePath, basePageTitle + ' > Start > ' + flowName + ' > ' + stepName );

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		context.store.dispatch( setLayoutFocus( 'content' ) );

		renderWithReduxStore(
			React.createElement( SignupComponent, {
				path: context.path,
				refParameter,
				queryObject,
				locale: utils.getLocale( context.params ),
				flowName: flowName,
				stepName: stepName,
				stepSectionName: stepSectionName
			} ),
			'primary',
			context.store
		);
	}
};
