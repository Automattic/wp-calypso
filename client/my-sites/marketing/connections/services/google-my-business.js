/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { deleteStoredKeyringConnection } from 'state/sharing/keyring/actions';
import GoogleMyBusinessLogo from 'my-sites/google-my-business/logo';
import { SharingService, connectFor } from 'my-sites/marketing/connections/service';
import { requestSiteKeyrings } from 'state/site-keyrings/actions';
import { isRequestingSiteKeyrings } from 'state/site-keyrings/selectors';
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import getSiteUserConnectionsForGoogleMyBusiness from 'state/selectors/get-site-user-connections-for-google-my-business';
import {
	connectGoogleMyBusinessAccount,
	connectGoogleMyBusinessLocation,
	disconnectAllGoogleMyBusinessAccounts,
} from 'state/google-my-business/actions';

export class GoogleMyBusiness extends SharingService {
	static propTypes = {
		// This foreign propTypes access should be safe because we expect all of them to be removed
		// eslint-disable-next-line react/forbid-foreign-prop-types
		...SharingService.propTypes,
		saveRequests: PropTypes.object,
		siteSettings: PropTypes.object,
		connectGoogleMyBusinessAccount: PropTypes.func,
		disconnectGoogleMyBusinessAccount: PropTypes.func,
		deleteStoredKeyringConnection: PropTypes.func,
	};

	static defaultProps = {
		...SharingService.defaultProps,
		deleteStoredKeyringConnection: () => {},
	};

	externalAccessProvided = ( keyringConnectionId ) => {
		if ( ! keyringConnectionId ) {
			this.setState( {
				isAwaitingConnections: false,
				isConnecting: false,
			} );
			return;
		}
		this.props.connectGoogleMyBusinessAccount( this.props.siteId, keyringConnectionId );
	};

	// override `createOrUpdateConnection` to ignore connection update, this is only useful for publicize services
	createOrUpdateConnection = ( keyringConnectionId, externalUserId ) => {
		this.props
			.connectGoogleMyBusinessLocation( this.props.siteId, keyringConnectionId, externalUserId )
			.catch( () => {
				this.props.failCreateConnection( {
					message: this.props.translate( 'Error while linking your site to %(service)s.', {
						args: { service: this.props.service.label },
					} ),
				} );
			} )
			.finally( () => {
				this.setState( { isConnecting: false } );
			} );
	};

	// override `removeConnection` to remove the keyring connection instead of the publicize one
	removeConnection = () => {
		this.setState( { isDisconnecting: true } );
		this.props.disconnectAllGoogleMyBusinessAccounts( this.props.siteId ).finally( () => {
			this.setState( { isDisconnecting: false } );
		} );
	};

	UNSAFE_componentWillMount() {
		this.requestKeyrings( this.props );
	}

	requestKeyrings( props ) {
		const { requestingSiteKeyrings, siteId } = props;
		if ( ! requestingSiteKeyrings && siteId ) {
			props.requestSiteKeyrings( siteId );
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.siteId && this.props.siteId !== nextProps.siteId ) {
			this.requestKeyrings( nextProps );
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

	getDisclamerText() {
		if ( 1 === this.props.availableExternalAccounts.length ) {
			return this.props.translate( 'Confirm this is the location you wish to connect to' );
		}
		return this.props.translate( 'Select the location you wish to connect your site to.' );
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
	( state, props ) => ( {
		...props,
		availableExternalAccounts: getGoogleMyBusinessLocations( state, props.siteId ),
		requestingSiteKeyrings: isRequestingSiteKeyrings( state, props.siteId ),
		saveRequests: state.siteSettings.saveRequests,
		removableConnections: props.keyringConnections,
		fetchConnection: props.requestKeyringConnections,
		siteUserConnections: getSiteUserConnectionsForGoogleMyBusiness( state, props.siteId ),
	} ),
	{
		connectGoogleMyBusinessAccount,
		connectGoogleMyBusinessLocation,
		disconnectAllGoogleMyBusinessAccounts,
		deleteStoredKeyringConnection,
		requestSiteKeyrings,
	}
);
