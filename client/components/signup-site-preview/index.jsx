/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';

const SignupSitePreview = ( props ) => (
	<AsyncLoad
		{ ...props }
		require="calypso/components/signup-site-preview/component"
		placeholder={ null }
	/>
);

export default SignupSitePreview;
