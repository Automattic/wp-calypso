/**
 * External dependencies
 */
import React from 'react';
import where from 'lodash/collection/where';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import analytics from 'analytics';
import SharingServicesGroup from './services-group';
import AccountDialog from './account-dialog';
import serviceConnections from './service-connections';

export default React.createClass( {
	displayName: 'SharingConnections',

	mixins: [ observe( 'sites', 'services', 'connections', 'user' ) ],

	getInitialState: function() {
		return { selectingAccountForService: null };
	},

	getConnections: function() {
		if ( this.props.sites.selected ) {
			return this.props.connections.get( this.props.sites.getSelectedSite().ID );
		} else {
			return this.props.connections.get();
		}
	},

	addConnection: function( service, keyringConnectionId, externalUserId ) {
		var siteId;
		if ( this.props.sites.selected ) {
			siteId = this.props.sites.getSelectedSite().ID;
		}

		if ( service ) {
			// Attempt to create a new connection. If a Keyring connection ID
			// is not provided, the user will need to authorize the app
			this.props.connections.create( service, siteId, keyringConnectionId, externalUserId );

			// In the case that a Keyring connection doesn't exist, wait for app
			// authorization to occur, then display with the available connections
			if ( ! keyringConnectionId ) {
				this.props.connections.once( 'connect', function() {
					if ( serviceConnections.didKeyringConnectionSucceed( service.name, siteId ) &&
							serviceConnections.isServiceForPublicize( service.name ) ) {
						this.setState( { selectingAccountForService: service } );
					}
				}.bind( this ) );
			} else {
				analytics.ga.recordEvent( 'Sharing', 'Clicked Connect Button in Modal', this.state.selectingAccountForService.name );
			}
		} else {
			// If an account wasn't selected from the dialog or the user cancels
			// the connection, the dialog should simply close
			this.props.connections.emit( 'create:error', { cancel: true } );
			analytics.ga.recordEvent( 'Sharing', 'Clicked Cancel Button in Modal', this.state.selectingAccountForService.name );
		}

		// Reset active account selection
		this.setState( { selectingAccountForService: null } );
	},

	refreshConnection: function( connection ) {
		this.props.connections.refresh( connection );
	},

	removeConnection: function( connections ) {
		connections = serviceConnections.filterConnectionsToRemove( connections );
		this.props.connections.destroy( connections );
	},

	toggleSitewideConnection: function( connection, isSitewide ) {
		this.props.connections.update( connection, { shared: isSitewide } );
	},

	getAccountDialog: function() {
		var isSelectingAccount = !! this.state.selectingAccountForService,
			accounts, siteId;

		if ( isSelectingAccount ) {
			if ( this.props.sites.selected ) {
				siteId = this.props.sites.getSelectedSite().ID;
			}

			accounts = serviceConnections.getAvailableExternalAccounts( this.state.selectingAccountForService.name, siteId );
		}

		return (
			<AccountDialog
				isVisible={ isSelectingAccount }
				service={ this.state.selectingAccountForService }
				accounts={ accounts }
				onAccountSelected={ this.addConnection } />
		);
	},

	renderServiceGroups: function() {
		var commonGroupProps = {
			user: this.props.user,
			connections: this.props.connections,
			onAddConnection: this.addConnection,
			onRemoveConnection: this.removeConnection,
			onRefreshConnection: this.refreshConnection,
			onToggleSitewideConnection: this.toggleSitewideConnection,
			initialized: this.props.services.initialized && !! this.props.sites.selected
		}, services = this.props.services.get();

		if ( this.props.sites.selected ) {
			commonGroupProps.site = this.props.sites.getSelectedSite();
		}

		return (
			<div>
				<SharingServicesGroup
					services={ where( services, { type: 'publicize' } ) }
					title={ this.translate( 'Publicize Your Posts' ) }
					{ ...commonGroupProps } />
				<SharingServicesGroup
					services={ where( services, { type: 'other' } ) }
					title={ this.translate( 'Other Connections' ) }
					description={ this.translate( 'Connect any of these additional services to further enhance your site.' ) }
					{ ...commonGroupProps } />
			</div>
		);
	},

	render: function() {
		return (
			<div id="sharing-connections" className="sharing-settings sharing-connections">
				{ this.getAccountDialog() }
				{ this.renderServiceGroups() }
			</div>
		);
	}
} );
