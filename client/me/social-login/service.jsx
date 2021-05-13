/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import SocialLoginActionButton from './action-button';

const SocialLoginService = ( {
	service,
	icon,
	isConnected,
	redirectUri,
	socialConnectionEmail,
	socialServiceResponse,
} ) => (
	<CompactCard>
		<div className="social-login__header">
			<div className="social-login__header-info">
				<div className="social-login__header-icon">{ icon }</div>
				<h3>{ service }</h3>
				{ socialConnectionEmail && <p>{ ' - ' + socialConnectionEmail }</p> }
			</div>

			<div className="social-login__header-action">
				<SocialLoginActionButton
					redirectUri={ redirectUri }
					service={ service }
					isConnected={ isConnected }
					socialServiceResponse={ socialServiceResponse }
				/>
			</div>
		</div>
	</CompactCard>
);

export default connect( ( state, { service } ) => {
	const currentUser = getCurrentUser( state );
	const connections = currentUser.social_login_connections || [];
	const socialLoginConnection = find( connections, { service } );
	return {
		isConnected: !! socialLoginConnection,
		socialConnectionEmail: get( socialLoginConnection, 'service_user_email', '' ),
	};
} )( SocialLoginService );
