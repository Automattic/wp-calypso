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
import { isRequestingSiteSettings } from 'state/site-settings/selectors';
import { getGoogleMyBusinessConnectedLocation } from 'state/selectors';
import { getSiteSettings } from '../../../../state/site-settings/selectors';

export class GoogleMyBusiness extends SharingService {
	static propTypes = {
		...SharingService.propTypes,
		saveSiteSettings: PropTypes.func,
		saveRequests: PropTypes.object,
		siteSettings: PropTypes.object,
		deleteStoredKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
	};

	// override `createOrUpdateConnection` to ignore connection update, this is only useful for publicize services
	createOrUpdateConnection = ( keyringConnectionId, externalUserId = 0 ) => {
		this.props
			.saveSiteSettings( this.props.siteId, {
				google_my_business_keyring_id: keyringConnectionId,
				google_my_business_location_id: externalUserId,
			} )
			.then( ( { updated } ) => {
				if (
					! updated.hasOwnProperty( 'google_my_business_keyring_id' ) &&
					! updated.hasOwnProperty( 'google_my_business_location_id' )
				) {
					this.props.failCreateConnection( {
						message: this.props.translate( 'Error while linking your site to %(service)s.', {
							args: { service: this.props.service.label },
							context: 'Sharing: External connection error',
						} ),
					} );
					this.setState( { isConnecting: false } );
				}
			} );
	};

	// override `removeConnection` to remove the keyring connection instead of the publicize one
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props
			.saveSiteSettings( this.props.siteId, {
				google_my_business_keyring_id: null,
				google_my_business_location_id: null,
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

export default connectFor(
	GoogleMyBusiness,
	( state, props ) => {
		const connectedLocation = getGoogleMyBusinessConnectedLocation( state, props.siteId );

		// only keep external connections (aka GMB locations) to choose from
		const availableExternalAccounts = filter( props.availableExternalAccounts || [], {
			isExternal: true,
		} );

		return {
			...props,
			availableExternalAccounts,
			siteSettings: getSiteSettings( state, props.siteId ),
			requestingSiteSettings: isRequestingSiteSettings( state, props.siteId ),
			saveRequests: state.siteSettings.saveRequests,
			removableConnections: props.keyringConnections,
			fetchConnection: props.requestKeyringConnections,
			siteUserConnections: connectedLocation ? [ connectedLocation ] : [],
		};
	},
	{
		deleteStoredKeyringConnection,
		requestSiteSettings,
		saveSiteSettings,
	}
);
