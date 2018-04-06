/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { filter, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import GoogleMyBusinessLogo from 'my-sites/google-my-business/logo';
import { SharingService, connectFor } from 'my-sites/sharing/connections/service';
import { requestSiteSettings, saveSiteSettings } from 'state/site-settings/actions';
import {
	getSiteSettings,
	isRequestingSiteSettings,
} from 'state/site-settings/selectors';

export class GoogleMyBusiness extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		saveSiteSettings: PropTypes.func,
		saveRequests: PropTypes.object,
		deleteStoredKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
	};

	// override `createOrUpdateConnection` to ignore connection update, this is only useful for publicize services
	createOrUpdateConnection = ( keyringConnectionId, externalUserId = 0 ) => {
		this.props.saveSiteSettings( this.props.siteId, {
			gmb_api_token: keyringConnectionId,
			gmb_location_id: externalUserId,
		} );
	};

	// override `removeConnection` to remove the keyring connection instead of the publicize one
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props
			.saveSiteSettings( this.props.siteId, {
				gmb_api_token: null,
				gmb_location_id: null,
			} )
			.then( () => {
				this.setState( { isDisconnecting: false } );
			} );
	};

	componentWillMount() {
		this.requestSettings( this.props );
	}

	requestSettings( props ) {
		const { requestingSiteSettings, siteId } = props;
		if ( ! requestingSiteSettings && siteId ) {
			props.requestSiteSettings( siteId );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId && this.props.siteId !== nextProps.siteId ) {
			this.requestSettings( nextProps );
		}

		if ( this.state.isAwaitingConnections ) {
			this.setState( {
				isAwaitingConnections: false,
				isSelectingAccount: true,
			} );
			return;
		}

		if ( ! isEqual( this.props.brokenConnections, nextProps.brokenConnections ) ) {
			this.setState( { isRefreshing: false } );
		}

		// do not use `availableExternalAccounts` as a datasource to know if a connection was successful
		// because we allow the same location to be used on multiple sites in the case of GMB.
		// Just check that a new connection is added
		if ( ! isEqual( this.props.siteUserConnections, nextProps.siteUserConnections ) ) {
			this.setState( {
				isConnecting: false,
				isDisconnecting: false,
			} );
		}
	}

	renderLogo() {
		// Render a custom logo here because Google My Business is not part of SocialLogos
		return (
			<GoogleMyBusinessLogo
				className="sharing-service__logo"
				height="36"
				style={ { padding: 6 + 'px' } }
				width="36"
			/>
		);
	}
}

const getSiteKeyringConnections = ( service, connections, siteSettings ) => {
	if (
		! service ||
		! siteSettings ||
		! siteSettings.gmb_api_token ||
		! siteSettings.gmb_location_id
	) {
		return [];
	}

	const keyringConnections = [];
	connections.forEach( connection => {
		if ( connection.additional_external_users ) {
			connection.additional_external_users.forEach( externalUser => {
				keyringConnections.push( {
					...connection,
					keyring_connection_ID: connection.ID,
					external_ID: externalUser.external_ID,
					external_display: externalUser.external_name,
				} );
			} );
		}
	} );

	return filter( keyringConnections, {
		service: service.ID,
		keyring_connection_ID: siteSettings.gmb_api_token,
		external_ID: siteSettings.gmb_location_id,
	} );
};

export default connectFor(
	GoogleMyBusiness,
	( state, props ) => {
		const siteSettings = getSiteSettings( state, props.siteId );

		// only keep external connections (aka GMB locations) to choose from
		const availableExternalAccounts = filter( props.availableExternalAccounts || [], {
			isExternal: true,
		} );

		const siteUserConnections = getSiteKeyringConnections(
			props.service,
			props.keyringConnections,
			siteSettings
		);

		return {
			...props,
			availableExternalAccounts,
			requestingSiteSettings: isRequestingSiteSettings( state, props.siteId ),
			saveRequests: state.siteSettings.saveRequests,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections,
		};
	},
	{
		deleteStoredKeyringConnection,
		requestSiteSettings,
		saveSiteSettings,
	}
);
