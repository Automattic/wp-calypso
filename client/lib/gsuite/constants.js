/**
 * External dependencies
 */
import PropTypes from 'prop-types';

export const GSUITE_BASIC_SLUG = 'gapps';
export const GSUITE_BUSINESS_SLUG = 'gapps_unlimited';
export const GSUITE_EXTRA_LICENSE_SLUG = 'gapps_extra_license';

export const GSUITE_SLUG_PROP_TYPES = PropTypes.oneOf( [
	GSUITE_BASIC_SLUG,
	GSUITE_BUSINESS_SLUG,
] );

export const GSUITE_LINK_PREFIX = 'https://mail.google.com/a/';
