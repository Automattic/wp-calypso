/**
 * External dependencies
 */

import React from 'react';
import cssSafeUrl from 'calypso/lib/css-safe-url';

/**
 * Internal dependencies
 */
import FormToggle from 'calypso/components/forms/form-toggle';
import classNames from 'classnames';
import SocialLogo from 'calypso/components/social-logo';

const PostShareConnection = ( { connection, isActive, onToggle } ) => {
	const {
		external_display,
		external_profile_picture,
		keyring_connection_ID,
		service,
		status,
	} = connection;

	const toggle = () => onToggle( keyring_connection_ID );

	const classes = classNames( {
		'post-share__service': true,
		[ service ]: true,
		'is-active': isActive,
		'is-broken': status === 'broken',
	} );

	const accountImageStyle = {};
	if ( external_profile_picture ) {
		accountImageStyle.backgroundImage = 'url( ' + cssSafeUrl( external_profile_picture ) + ' )';
	} else {
		accountImageStyle.backgroundColor = 'rgb( 168, 190, 206 )';
	}

	return (
		<div onClick={ toggle } className={ classes } role="presentation">
			<div className="post-share__service-account-image" style={ accountImageStyle }>
				&nbsp;
			</div>

			<div className="post-share__service-account-social-logo">
				<SocialLogo icon={ service === 'google_plus' ? 'google-plus' : service } />
			</div>

			<div className="post-share__service-account-name">
				<span>{ external_display }</span>
			</div>
			<FormToggle checked={ isActive } />
		</div>
	);
};

export default PostShareConnection;
