/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DeleteEmailForwardsDialog from './delete-email-forwards-dialog';
import DnsRecord from './dns-record';
import { isDeletingLastMXRecord } from 'lib/domains/dns';
import { deleteDns as deleteDnsAction, addDns as addDnsAction } from 'lib/upgrades/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';

class DnsList extends React.Component {
	static propTypes = {
		dns: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired
	};

	state = {
		dialog: this.noDialog()
	};

	noDialog() {
		return {
			type: null,
			onClose: null
		};
	}

	openDialog( type, onClose ) {
		this.setState( {
			dialog: {
				type,
				onClose
			}
		} );
	}

	handleDialogClose = ( result ) => {
		this.state.dialog.onClose( result );
		this.setState( { dialog: this.noDialog() } );
	};

	deleteDns = ( record, confirmed = false ) => {
		const { selectedDomainName, translate } = this.props;
		const { records } = this.props.dns;

		if ( ! confirmed && isDeletingLastMXRecord( record, records ) ) {
			this.openDialog( 'deleteEmailForwards', ( result ) => {
				if ( result.shouldDeleteEmailForwards ) {
					this.deleteDns( record, true );
				}
			} );

			return;
		}

		deleteDnsAction( selectedDomainName, record, ( error ) => {
			if ( error ) {
				this.props.errorNotice(
					error.message || translate( 'The DNS record has not been deleted.' )
				);
			} else {
				const successNoticeId = 'dns-list-success-notice';
				this.props.successNotice(
					translate( 'The DNS record has been deleted.' ),
					{
						id: successNoticeId,
						showDismiss: false,
						duration: 5000,
						button: translate( 'Undo' ),
						onClick: () => {
							this.props.removeNotice( successNoticeId );
							this.addDns( record );
						}
					}
				);
			}
		} );
	};

	addDns( record ) {
		const { translate } = this.props;

		addDnsAction( this.props.selectedDomainName, record, ( error ) => {
			if ( error ) {
				this.props.errorNotice(
					error.message || translate( 'The DNS record could not be restored.' )
				);
			} else {
				this.props.successNotice(
					translate( 'The DNS record has been restored.' ),
					{
						duration: 5000
					}
				);
			}
		} );
	}

	render() {
		const { dialog } = this.state;
		const { dns, selectedDomainName, selectedSite } = this.props;
		const dnsRecordsList = dns.records.map( ( dnsRecord, index ) => {
			return (
				<DnsRecord
					key={ index }
					dnsRecord={ dnsRecord }
					onDeleteDns={ this.deleteDns }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
			);
		} );

		return (
			<div className="dns__list">
				<DeleteEmailForwardsDialog
					visible={ dialog.type === 'deleteEmailForwards' }
					onClose={ this.handleDialogClose }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
				<ul>
					{ dnsRecordsList }
				</ul>
			</div>
		);
	}
}

export default connect(
	null,
	{
		errorNotice,
		removeNotice,
		successNotice,
	}
)( localize( DnsList ) );
