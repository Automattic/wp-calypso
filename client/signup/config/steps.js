/** @format */

/**
 * External dependencies
 */

import { current as currentPage } from 'page';

/**
 * Internal dependencies
 */
import {
	addPlanToCart,
	createAccount,
	createSite,
	createSiteOrDomain,
	createSiteWithCart,
	setThemeOnSite,
} from 'lib/signup/step-actions';
import { generateSteps } from './steps-pure';
import { abtest } from 'lib/abtest';

export default generateSteps( {
	addPlanToCart,
	createAccount,
	createSite,
	createSiteOrDomain,
	createSiteWithCart,
	currentPage,
	setThemeOnSite,
	removeUsernameTest: abtest( 'removeUsername' ),
} );
