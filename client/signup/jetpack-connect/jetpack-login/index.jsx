/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
// import Button from 'components/button';
import Card from 'components/card';
import MainWrapper from '../main-wrapper';
import Login from 'blocks/login';
import { localize } from 'i18n-calypso';

const JetpackLogin = ( { translate } ) => {
	return (
		<MainWrapper>
			<div className="jetpack-connect__login">
				<div className="jetpack-connect__login-header">
					<Gridicon icon="user-circle" />
					{ translate( 'You are signed out' ) }
				</div>
				<Card className="jetpack-connect__login-container">
					<Login title={ translate( 'Sign in to connect to WordPress.com' ) }></Login>
				</Card>
			</div>
		</MainWrapper>
	);
};

export default localize( JetpackLogin );
