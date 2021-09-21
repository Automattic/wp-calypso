import { Button, ScreenReaderText } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { getKeyringConnectionsByName } from 'calypso/state/sharing/keyring/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const GooglePhotosAccount = ( props ) => {
	if ( ! props.connection ) {
		return null;
	}

	const profileImage = () => {
		if ( props.connection.external_profile_picture ) {
			return (
				<img
					height="20"
					width="20"
					src={ props.connection.external_profile_picture }
					alt={ props.connection.label }
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					className="google-photos-account__account-avatar"
				/>
			);
		}

		return (
			<span
				className={
					'google-photos-account__account-avatar is-fallback ' + props.connection.service
				}
			>
				<ScreenReaderText>{ props.connection.label }</ScreenReaderText>
			</span>
		);
	};

	const disconnectButton = () => {
		if ( props.userHasCaps || props.connection.user_ID === props.userId ) {
			const deleteConnection = () => props.deleteStoredKeyringConnection( props.connection );

			return (
				<Button
					compact
					onClick={ deleteConnection }
					className="google-photos-account__account-action disconnect"
				>
					{ props.translate( 'Disconnect from Google Photos' ) }
				</Button>
			);
		}
	};

	return (
		<div className="google-photos-account">
			{ profileImage() }
			<span className="google-photos-account__account-name">
				{ props.connection.external_name }
			</span>
			{ disconnectButton() }
		</div>
	);
};

export default connect(
	( state ) => {
		const googleConnection = getKeyringConnectionsByName( state, 'google_photos' );
		const siteId = getSelectedSiteId( state );

		return {
			userHasCaps: canCurrentUser( state, siteId, 'edit_others_posts' ),
			userId: getCurrentUserId( state ),
			connection: googleConnection.length === 1 ? googleConnection[ 0 ] : null, // There can be only one
		};
	},
	{
		deleteStoredKeyringConnection,
	}
)( localize( GooglePhotosAccount ) );
