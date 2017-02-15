/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MainWrapper from '../main-wrapper';
import Login from 'blocks/login';

const JetpackLogin = ( { translate } ) => {
	return (
		<MainWrapper>
			<div className="jetpack-connect__login">
				<div className="jetpack-connect__login-header">
					<Gridicon icon="user-circle" size={ 64 } />
					<div>{ translate( 'You are signed out' ) }</div>
				</div>
				<div className="jetpack-connect__login-container">
					<Login />
				</div>
			</div>
		</MainWrapper>
	);
};

export default localize( JetpackLogin );
