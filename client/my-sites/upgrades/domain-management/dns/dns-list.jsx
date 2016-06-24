/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DnsRecord from './dns-record';
import notices from 'notices';
import { deleteDns as deleteDnsAction, addDns as addDnsAction } from 'lib/upgrades/actions';

const DnsList = React.createClass( {
	propTypes: {
		dns: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	deleteDns: function( record ) {
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
		const dnsRecordsList = this.props.dns.records.map( function( dnsRecord, index ) {
			return (
				<DnsRecord
					key={ index }
					dnsRecord={ dnsRecord }
					onDeleteDns={ this.deleteDns }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite } />
			);
		}, this );

		return (
			<ul className="dns__list">{ dnsRecordsList }</ul>
		);
	}
} );

export default DnsList;
