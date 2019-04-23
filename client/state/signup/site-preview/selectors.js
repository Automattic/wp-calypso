/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export const getSignupSitePreviewLastShown = state =>
	get( state, 'signup.sitePreview.lastShown', null );
