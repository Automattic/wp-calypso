/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
	GSUITE_EXTRA_LICENSE_SLUG,
} from '@automattic/calypso-products';
export {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
	GSUITE_EXTRA_LICENSE_SLUG,
};

export const GSUITE_SLUG_PROP_TYPES = PropTypes.oneOf( [
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
] );

/**
 * We'll use the following constants to do the switchover from
 * G Suite -> Google Workspace.
 * The product name is never translated in the translation strings
 * so we won't translate them here either.
 */
export const GSUITE_PRODUCT_FAMILY = 'G Suite';
export const GOOGLE_WORKSPACE_PRODUCT_FAMILY = 'Google Workspace';

/**
 * Defines product types to use as slugs in urls.
 *
 * @see emailManagementAddGSuiteUsers() in client/my-sites/email/paths.js
 * @see emailManagementNewGSuiteAccount() in client/my-sites/email/paths.js
 */
export const GOOGLE_WORKSPACE_PRODUCT_TYPE = 'google-workspace';
export const GSUITE_PRODUCT_TYPE = 'gsuite';
