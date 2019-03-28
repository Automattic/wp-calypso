/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { deleteDns, addDns } from 'lib/upgrades/actions';
import Toggle from 'components/forms/form-toggle';
import { domainConnect } from 'lib/domains/constants';
import { getNormalizedData } from 'lib/domains/dns';
import DnsRecordsList from '../dns-records/list';

/**
 * Style dependencies
 */
import './domain-connect-record.scss';

class DomainConnectRecord extends React.Component {
	static propTypes = {
		enabled: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		hasWpcomNameservers: PropTypes.bool.isRequired,
	};

	state = {
		enabled: this.props.enabled,
	};

	disableDomainConnect = () => {
		const { selectedDomainName, translate } = this.props;
		const record = {
			name: domainConnect.DISCOVERY_TXT_RECORD_NAME,
			data: domainConnect.API_URL,
			type: 'TXT',
		};

		deleteDns( selectedDomainName, record, error => {
			if ( error ) {
				this.props.errorNotice(
					error.message || translate( 'The Domain Connect record could not be disabled.' )
				);
			} else {
				const successNoticeId = 'domain-connect-disable-success-notice';
				this.props.successNotice( translate( 'The Domain Connect record has been disabled.' ), {
					id: successNoticeId,
					showDismiss: false,
					duration: 5000,
				} );
			}
		} );
	};

	enableDomainConnect() {
		const { translate } = this.props;
		const record = {
			name: domainConnect.DISCOVERY_TXT_RECORD_NAME,
			data: domainConnect.API_URL,
			type: 'TXT',
		};

		const normalizedData = getNormalizedData( record, this.props.selectedDomainName );

		addDns( this.props.selectedDomainName, normalizedData, error => {
			if ( error ) {
				this.props.errorNotice(
					error.message || translate( 'The Domain Connect record could not be enabled.' )
				);
			} else {
				this.props.successNotice( translate( 'The Domain Connect record has been enabled.' ), {
					showDismiss: false,
					duration: 5000,
				} );
			}
		} );
	}

	handleToggle = () => {
		// this.setState( { enabled: ! this.state.enabled } );
		if ( this.props.enabled ) {
			this.disableDomainConnect();
		} else {
			this.enableDomainConnect();
		}
	};

	render() {
		const { enabled, selectedDomainName, hasWpcomNameservers, translate } = this.props;

		if ( ! hasWpcomNameservers ) {
			return null;
		}

		const name = `${ domainConnect.DISCOVERY_TXT_RECORD_NAME }.${ selectedDomainName }`;

		return (
			<Fragment>
				<DnsRecordsList className="dns__domain-connect-record">
					<li className={ classNames( 'dns__list-item', { 'is-disabled': ! enabled } ) }>
						<div className="dns__list-type">
							<span>TXT</span>
						</div>
						<div className="dns__list-info">
							<strong>{ name }</strong>
							<em>{ translate( 'Handled by WordPress.com' ) }</em>
						</div>
						<form className="dns__domain-connect-toggle">
							<Toggle
								id="domain-connect-record"
								name="domain-connect-record"
								onChange={ this.handleToggle }
								type="checkbox"
								checked={ enabled }
								value="active"
							/>
						</form>
					</li>
				</DnsRecordsList>
				<div className="dns__domain-connect-explanation">
					<em>
						{ translate(
							'Enabling this special DNS record allows you to automatically configure ' +
								'some third party services. '
						) }
					</em>
				</div>
			</Fragment>
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
)( localize( DomainConnectRecord ) );
