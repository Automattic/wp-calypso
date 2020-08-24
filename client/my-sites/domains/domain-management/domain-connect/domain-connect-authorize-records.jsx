/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DnsRecordsList from '../dns-records/list';
import DomainConnectDnsRecord from './domain-connect-dns-record';

class DomainConnectAuthorizeRecords extends Component {
	static propTypes = {
		domain: PropTypes.string,
		dnsTemplateConflicts: PropTypes.array,
		dnsTemplateRecords: PropTypes.array,
		isPlaceholder: PropTypes.bool,
	};

	static defaultProps = {
		conflictingRecords: [],
		isPlaceholder: false,
	};

	state = {
		recordsVisible: false,
	};

	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span />
				<span />
			</div>
		);
	};

	renderDnsRecords = ( records ) => {
		return (
			<DnsRecordsList>
				{ records.map( ( record, index ) => (
					<DomainConnectDnsRecord key={ index } domain={ this.props.domain } dnsRecord={ record } />
				) ) }
			</DnsRecordsList>
		);
	};

	renderConflictingRecords = () => {
		const { dnsTemplateConflicts, translate } = this.props;

		if ( dnsTemplateConflicts && dnsTemplateConflicts.length && this.state.recordsVisible ) {
			return (
				<Card className="domain-connect__dns-records">
					<p>{ translate( "We're going to remove or replace these records:" ) }</p>
					{ this.renderDnsRecords( dnsTemplateConflicts ) }
					<p>
						{ translate(
							'The services that these records were used for may no longer work if they ' +
								'are removed. If you are trying to switch from one service provider to another ' +
								'this is probably what you want to do.'
						) }
					</p>
				</Card>
			);
		}

		return null;
	};

	renderDnsTemplateRecords = () => {
		const { dnsTemplateRecords, translate } = this.props;

		if ( this.state.recordsVisible ) {
			return (
				<Card className="domain-connect__dns-records">
					<p>{ translate( "We're going add these records:" ) }</p>
					{ this.renderDnsRecords( dnsTemplateRecords ) }
				</Card>
			);
		}

		return null;
	};

	toggleRecordsVisible = () => {
		this.setState( { recordsVisible: ! this.state.recordsVisible } );
	};

	render() {
		const { dnsTemplateRecords, isPlaceholder, translate } = this.props,
			showRecordsLinkText = this.state.recordsVisible
				? translate( 'Hide Changes.' )
				: translate( 'View Changes.' );

		if ( isPlaceholder ) {
			return this.placeholder();
		}

		if ( ! ( dnsTemplateRecords && dnsTemplateRecords.length ) ) {
			return null;
		}

		/* eslint-disable jsx-a11y/anchor-is-valid,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		return (
			<div>
				<p>
					<span>
						{ translate(
							"To set up this service, we're going to make some changes to the " +
								'the DNS records for your domain.'
						) }
					</span>
					&nbsp;
					<a onClick={ this.toggleRecordsVisible }>{ showRecordsLinkText }</a>
				</p>
				{ this.renderDnsTemplateRecords() }
				{ this.renderConflictingRecords() }
			</div>
		);
		/* eslint-enable jsx-a11y/anchor-is-valid,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	}
}

export default localize( DomainConnectAuthorizeRecords );
