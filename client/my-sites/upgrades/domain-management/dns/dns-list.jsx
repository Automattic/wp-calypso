/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
/**
 * Internal dependencies
 */
import DnsRecord from './dns-record';
import notices from 'notices';
import { deleteDns as deleteDnsAction } from 'lib/upgrades/actions';
import { successNotice } from 'state/notices/actions';

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
			}
		} );
	},

	render: function() {
		const dnsRecordsList = this.props.dns.records.map( function( dnsRecord, index ) {
			return (
				<DnsRecord
					key={ index }
					dnsRecord={ dnsRecord }
					deleteDns={ this.deleteDns }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite } />
			);
		}, this );

		return (
			<ul className="dns__list">{ dnsRecordsList }</ul>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( DnsList );
