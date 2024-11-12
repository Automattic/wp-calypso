import { last } from 'lodash';
import googleDriveLogo from 'calypso/assets/images/connections/google-drive-logo.svg';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { SharingService, connectFor } from '../service';

export class GoogleDrive extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
	};

	createOrUpdateConnection = () => {};

	/**
	 * Deletes the passed connections.
	 */
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.deleteStoredKeyringConnection( last( this.props.keyringConnections ) );
	};

	didKeyringConnectionSucceed( availableExternalAccounts ) {
		if ( availableExternalAccounts.length === 0 ) {
			this.props.failCreateConnection( {
				message: [
					this.props.translate( 'The Google Drive connection could not be made.', {
						context: 'Sharing: Jetpack Social connection error',
					} ),
					' ',
					' ',
				],
			} );
			this.setState( { isConnecting: false } );
			return false;
		}

		return super.didKeyringConnectionSucceed( availableExternalAccounts );
	}

	/*
	 * We render a custom logo here instead of using SocialLogos as we need a full colour logo and SocialLogos currently strips all colour
	 * When SocialLogos supports colour logos then we can remove this and use the default renderLogo() in SharingService
	 */
	renderLogo() {
		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<img
				className="sharing-service__logo"
				src={ googleDriveLogo }
				width="48"
				height="48"
				alt=""
			/>
		);
	}
}

export default connectFor(
	GoogleDrive,
	( state, props ) => {
		return {
			...props,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: props.keyringConnections.map( ( connection ) => ( {
				...connection,
				keyring_connection_ID: connection.ID,
			} ) ),
		};
	},
	{
		deleteStoredKeyringConnection,
	}
);
