/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { Login } from 'blocks/login';

const redirect = () => {
	page( '/pandance/content-preview?type=final' );
};

const translate = text => text;

export default props => {
	return <Login isRequestingLogin={ false } loginUser={ redirect } translate={ translate } title="Do your thing" />
};
