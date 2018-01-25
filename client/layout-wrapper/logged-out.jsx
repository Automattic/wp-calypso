/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import LayoutLoggedOut from 'layout/logged-out';

const LoggedOutLayout = ( { primary, secondary, redirectUri } ) =>
	<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />;

export default LoggedOutLayout;
