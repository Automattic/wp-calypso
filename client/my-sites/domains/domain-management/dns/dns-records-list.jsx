import page from '@automattic/calypso-router';
import { MaterialIcon } from '@automattic/components';
import { edit, Icon, info, redo, trash } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { domainConnect } from 'calypso/lib/domains/constants';
import DnsRecordsListHeader from 'calypso/my-sites/domains/domain-management/dns/dns-records-list-header';
import { domainManagementDnsEditRecord } from 'calypso/my-sites/domains/paths';
import { addDns, deleteDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import DeleteEmailForwardsDialog from './delete-email-forwards-dialog';
import DnsRecordData from './dns-record-data';
import DomainConnectInfoDialog from './domain-connect-info-dialog';

class DnsRecordsList extends Component {
	static propTypes = {
		dns: PropTypes.object.isRequired,
		selectedDomain: PropTypes.object.isRequired,
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
				viewBox="0 0 20 20"
			/>
		),
		title: this.props.translate( 'Disable' ),
		callback: ( record ) => this.deleteDns( record, 'disable' ),
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
		callback: () => this.openDialog( 'domainConenctInfo', () => {} ),
	};

	editRecordAction = {
		icon: (
			<Icon
				icon={ edit }
				size={ 18 }
				className="gridicon dns-records-list__action-menu-item"
				viewBox="2 2 20 20"
			/>
		),
		title: this.props.translate( 'Edit' ),
		callback: ( record ) => this.editDns( record ),
	};

	deleteRecordAction = {
		icon: (
			<Icon
				icon={ trash }
				size={ 18 }
				className="gridicon dns-records-list__action-menu-item"
				viewBox="2 2 20 20"
			/>
		),
		title: this.props.translate( 'Delete' ),
		callback: ( record ) => this.deleteDns( record ),
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

	editDns = ( record ) => {
		const { currentRoute, selectedDomainName, selectedSite } = this.props;
		page(
			domainManagementDnsEditRecord(
				selectedSite.slug,
				selectedDomainName,
				currentRoute,
				record.id
			)
		);
	};

	deleteDns = ( record, action = 'delete', confirmed = false ) => {
		const { selectedDomainName, translate } = this.props;

		if ( ! confirmed && record.protected_field && 'MX' === record.type ) {
			this.openDialog( 'deleteEmailForwards', ( result ) => {
				if ( result.shouldDeleteEmailForwards ) {
					this.deleteDns( record, action, true );
				}
			} );

			return;
		}

		const successMessage =
			'delete' === action
				? translate( 'The DNS record has been deleted.' )
				: translate( 'The DNS record has been disabled.' );

		const errorMessage =
			'delete' === action
				? translate( 'The DNS record has not been deleted.' )
				: translate( 'The DNS record has not been disabled.' );

		this.props.deleteDns( selectedDomainName, record ).then(
			() => {
				const successNoticeId = 'dns-list-success-notice';
				this.props.successNotice( successMessage, {
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
				this.props.errorNotice( error.message || errorMessage );
			}
		);
	};

	addDns( record ) {
		const { translate } = this.props;

		this.props.addDns( this.props.selectedDomainName, record ).then(
			() => {
				this.props.successNotice( translate( 'The DNS record has been enabled.' ), {
					duration: 5000,
				} );
			},
			( error ) => {
				this.props.errorNotice(
					error.message || translate( 'The DNS record could not be enabled.' )
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

		const actions = [];

		if ( ! record.protected_field ) {
			actions.push( { ...this.editRecordAction } );
		}
		if ( ! ( record.protected_field && 'MX' !== record.type ) || record.type === 'A' ) {
			actions.push( { ...this.deleteRecordAction } );
		}
		return actions;
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
				key="domain-connect-record"
				dnsRecord={ record }
				selectedDomainName={ selectedDomainName }
				selectedSite={ selectedSite }
				enabled={ enabled }
				actions={ this.getActionsForDnsRecord( record ) }
			/>
		);
	}

	render() {
		const { dns, selectedDomain, selectedDomainName, selectedSite } = this.props;
		const { dialog } = this.state;

		let domainConnectRecordIsEnabled = false;
		const dnsRecordsList = dns.records.map( ( dnsRecord, index ) => {
			const isRootRecord = dnsRecord.name === `${ selectedDomainName }.`;

			// We want to hide root NS records for root domains, but not for subdomains
			if ( 'NS' === dnsRecord.type && ! selectedDomain.isSubdomain && isRootRecord ) {
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
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
					enabled
					actions={ this.getActionsForDnsRecord( dnsRecord ) }
				/>
			);
		} );

		return (
			<Fragment>
				<DeleteEmailForwardsDialog
					visible={ dialog.type === 'deleteEmailForwards' }
					onClose={ this.handleDialogClose }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
				<DomainConnectInfoDialog
					visible={ dialog.type === 'domainConenctInfo' }
					onClose={ this.handleDialogClose }
				/>
				<div className="dns-records-list">
					{ [
						<DnsRecordsListHeader key="header" />,
						...dnsRecordsList,
						this.getDomainConnectDnsRecord( domainConnectRecordIsEnabled ),
					] }
				</div>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => ( {
		currentRoute: getCurrentRoute( state ),
	} ),
	{
		addDns,
		deleteDns,
		errorNotice,
		removeNotice,
		successNotice,
	}
)( localize( DnsRecordsList ) );
