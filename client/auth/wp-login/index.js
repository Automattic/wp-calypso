/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import LoginBlock from 'blocks/login';
import { localize } from 'i18n-calypso';

const Login = ( { translate } ) => (
	<Main className="wp-login">
		<div className="wp-login__header">
			<Gridicon icon="user-circle" size={ 72 } />
			<div>{ translate( 'You are signed out' ) }</div>
		</div>
		<div className="wp-login__container">
			<LoginBlock
				title={ translate( 'Sign in to WordPress.com' ) } />
		</div>
	</Main>
);

export default localize( Login );
