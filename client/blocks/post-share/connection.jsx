/**
 * External dependencies
 */
import React from 'react';
import cssSafeUrl from 'lib/css-safe-url';

/**
 * Internal dependencies
 */
import FormToggle from 'components/forms/form-toggle/compact';
import classNames from 'classnames';
import SocialLogo from 'social-logos';

const PostShareConnection = ( {
	connection,
	isActive,
	onToggle,
} ) => {
	const {
		external_display,
		external_profile_picture,
		keyring_connection_ID,
		service,
	} = connection;

	const toggle = () => onToggle( keyring_connection_ID );

	const classes = classNames( {
		'post-share__service': true,
		[ service ]: true,
		'is-active': isActive,
		'is-broken': status === 'broken'
	} );

	const backgroundImage = `url(${ cssSafeUrl( external_profile_picture ) })`;

	return (
		<div onClick={ toggle } className={ classes }>
			<div
				style={ { backgroundImage } }
				className="post-share__service-account-image"
			>
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
