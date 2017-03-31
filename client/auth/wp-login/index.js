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
import { isEnabled } from 'config';
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
		<div className="wp-login__footer">
			{
				isEnabled( 'magic-login' ) && (
					<a href="/login/send-me-a-link">{ translate( 'Email me a login link' ) }</a>
				)
			}
		</div>
	</Main>
);

export default localize( Login );
