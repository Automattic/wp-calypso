/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DeleteEmailForwardsDialog from './delete-email-forwards-dialog';
import DnsRecord from './dns-record';
import notices from 'notices';
import { deleteDns as deleteDnsAction, addDns as addDnsAction } from 'lib/upgrades/actions';
import { isDeletingLastMXRecord } from 'lib/domains/dns';

const DnsList = React.createClass( {
	propTypes: {
		dns: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState: function() {
		return { dialog: this.noDialog() };
	},

	noDialog: function() {
		return {
			type: null,
			onClose: null
		};
	},

	openDialog( type, onClose ) {
		this.setState( {
			dialog: {
				type,
				onClose
			}
		} );
	},

	handleDialogClose( result ) {
		this.state.dialog.onClose( result );
		this.setState( { dialog: this.noDialog() } );
	},

	deleteDns: function( record, confirmed = false ) {
		const { records } = this.props.dns;

		if ( ! confirmed && isDeletingLastMXRecord( record, records ) ) {
			this.openDialog( 'deleteEmailForwards', ( result ) => {
				if ( result.shouldDeleteEmailForwards ) {
					this.deleteDns( record, true );
				}
			} );

			return;
		}

		deleteDnsAction( this.props.selectedDomainName, record, ( error ) => {
			if ( error ) {
				notices.error( error.message || this.translate( 'The DNS record has not been deleted.' ) );
			} else {
				const notice = notices.success( this.translate( 'The DNS record has been deleted.' ), {
					showDismiss: false,
					duration: 5000,
					button: this.translate( 'Undo' ),
					onClick: () => {
						notices.removeNotice( notice );
						this.addDns( record );
					}
				} );
			}
		} );
	},

	addDns: function( record ) {
		addDnsAction( this.props.selectedDomainName, record, ( error ) => {
			if ( error ) {
				notices.error( error.message || this.translate( 'The DNS record could not be restored.' ) );
			} else {
				notices.success( this.translate( 'The DNS record has been restored.' ), {
					duration: 5000
				} );
			}
		} );
	},

	render: function() {
		const { dialog } = this.state,
			{ dns, selectedDomainName, selectedSite } = this.props,
			dnsRecordsList = dns.records.map( function( dnsRecord, index ) {
				return (
					<DnsRecord
						key={ index }
						dnsRecord={ dnsRecord }
						onDeleteDns={ this.deleteDns }
						selectedDomainName={ selectedDomainName }
						selectedSite={ selectedSite } />
				);
			}, this );

		return (
			<div className="dns__list">
				<DeleteEmailForwardsDialog
					visible={ dialog.type === 'deleteEmailForwards' }
					onClose={ this.handleDialogClose }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite } />
				<ul>{ dnsRecordsList }</ul>
			</div>
		);
	}
} );

export default DnsList;
