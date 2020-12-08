/**
 * External dependencies
 */
import PropTypes from 'prop-types';

export const GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY =
	'wp_google_workspace_business_starter_yearly';
export const GSUITE_BASIC_SLUG = 'gapps';
export const GSUITE_BUSINESS_SLUG = 'gapps_unlimited';
export const GSUITE_EXTRA_LICENSE_SLUG = 'gapps_extra_license';

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
export const GSUITE_PRODUCT_NAME = 'G Suite';
export const GOOGLE_WORKSPACE_PRODUCT_NAME = 'Google Workspace';
