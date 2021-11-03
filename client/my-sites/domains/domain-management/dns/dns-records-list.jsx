import { Icon, info, redo } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import MaterialIcon from 'calypso/components/material-icon';
import { domainConnect } from 'calypso/lib/domains/constants';
import DnsRecordsListHeader from 'calypso/my-sites/domains/domain-management/dns/dns-records-list-header';
import { addDns, deleteDns } from 'calypso/state/domains/dns/actions';
import { isDeletingLastMXRecord } from 'calypso/state/domains/dns/utils';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import DnsRecordList from '../dns-records/list';
import DeleteEmailForwardsDialog from './delete-email-forwards-dialog';
import DnsRecord from './dns-record';
import DnsRecordData from './dns-record-data';

class DnsRecordsList extends Component {
	static propTypes = {
		dns: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	state = {
		dialog: this.noDialog(),
	};

	disableRecordAction = {
		icon: (
			<MaterialIcon
				icon="do_not_disturb"
				className="gridicon dns-records-list__action-menu-item"
				viewBox="2 2 20 20"
			/>
		),
		title: this.props.translate( 'Disable' ),
		callback: ( record ) => this.deleteDns( record ),
	};

	enableRecordAction = {
		icon: (
			<Icon
				icon={ redo }
				className="gridicon dns-records-list__action-menu-item"
				viewBox="2 2 20 20"
			/>
		),
		title: this.props.translate( 'Enable' ),
		callback: ( record ) => this.addDns( record ),
	};

	recordInfoAction = {
		icon: (
			<Icon
				icon={ info }
				className="gridicon dns-records-list__action-menu-item"
				viewBox="2 2 20 20"
			/>
		),
		title: this.props.translate( "What's this?" ),
		callback: () => {},
	};

	noDialog() {
		return {
			type: null,
			onClose: null,
		};
	}

	openDialog( type, onClose ) {
		this.setState( {
			dialog: {
				type,
				onClose,
			},
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

		this.props.deleteDns( selectedDomainName, record ).then(
			() => {
				const successNoticeId = 'dns-list-success-notice';
				this.props.successNotice( translate( 'The DNS record has been deleted.' ), {
					id: successNoticeId,
					showDismiss: false,
					duration: 5000,
					button: translate( 'Undo' ),
					onClick: () => {
						this.props.removeNotice( successNoticeId );
						this.addDns( record );
					},
				} );
			},
			( error ) => {
				this.props.errorNotice(
					error.message || translate( 'The DNS record has not been deleted.' )
				);
			}
		);
	};

	addDns( record ) {
		const { translate } = this.props;

		this.props.addDns( this.props.selectedDomainName, record ).then(
			() => {
				this.props.successNotice( translate( 'The DNS record has been restored.' ), {
					duration: 5000,
				} );
			},
			( error ) => {
				this.props.errorNotice(
					error.message || translate( 'The DNS record could not be restored.' )
				);
			}
		);
	}

	isDomainConnectRecord( dnsRecord ) {
		return (
			domainConnect.DISCOVERY_TXT_RECORD_NAME === dnsRecord.name &&
			domainConnect.API_URL === dnsRecord.data &&
			'TXT' === dnsRecord.type
		);
	}

	getActionsForDnsRecord( record ) {
		if ( this.isDomainConnectRecord( record ) ) {
			return [
				record.enabled ? this.disableRecordAction : this.enableRecordAction,
				this.recordInfoAction,
			];
		}
	}

	getDomainConnectDnsRecord( enabled ) {
		const { selectedDomainName, selectedSite } = this.props;
		const record = {
			name: domainConnect.DISCOVERY_TXT_RECORD_NAME,
			data: domainConnect.API_URL,
			type: 'TXT',
			enabled,
		};

		return (
			<DnsRecordData
				key={ 'domain-connect-record' }
				dnsRecord={ record }
				onDeleteDns={ this.deleteDns }
				selectedDomainName={ selectedDomainName }
				selectedSite={ selectedSite }
				enabled={ enabled }
				actions={ this.getActionsForDnsRecord( record ) }
			/>
		);
	}

	render() {
		const { dialog } = this.state;
		const { dns, selectedDomainName, selectedSite } = this.props;

		console.log( dns );

		let domainConnectRecordIsEnabled = false;
		const dnsRecordsList = dns.records.map( ( dnsRecord, index ) => {
			if ( 'NS' === dnsRecord.type ) {
				return;
			}

			if ( this.isDomainConnectRecord( dnsRecord ) ) {
				domainConnectRecordIsEnabled = true;
				return;
			}

			return (
				<DnsRecordData
					key={ index }
					dnsRecord={ dnsRecord }
					onDeleteDns={ this.deleteDns }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
					actions={ [] }
				/>
			);
		} );

		return (
			<Fragment>
				<ul className="dns-records-list">
					{ [
						<DnsRecordsListHeader key="header" />,
						...dnsRecordsList,
						this.getDomainConnectDnsRecord( domainConnectRecordIsEnabled ),
					] }
				</ul>
				<DeleteEmailForwardsDialog
					visible={ dialog.type === 'deleteEmailForwards' }
					onClose={ this.handleDialogClose }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
			</Fragment>
		);
	}
}

export default connect( null, {
	addDns,
	deleteDns,
	errorNotice,
	removeNotice,
	successNotice,
} )( localize( DnsRecordsList ) );
