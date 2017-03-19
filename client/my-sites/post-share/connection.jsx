/**
 * External dependencies
 */
import React from 'react';

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

	return (
		<div
			onClick={ toggle }
			className={ classes }
		>
			<FormToggle checked={ isActive } />
			<SocialLogo icon={ service === 'google_plus' ? 'google-plus' : service } />
			<div className="post-share__service-account-name">
				<span>{ external_display }</span>
			</div>
		</div>
	);
};

export default PostShareConnection;
