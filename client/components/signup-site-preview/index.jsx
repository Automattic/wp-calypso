/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

const SignupSitePreview = ( props ) => (
	<AsyncLoad { ...props } require="components/signup-site-preview/component" placeholder={ null } />
);

export default SignupSitePreview;
