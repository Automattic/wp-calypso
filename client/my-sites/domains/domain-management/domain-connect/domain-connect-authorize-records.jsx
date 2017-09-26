/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';

class DomainConnectAuthorizeRecords extends Component {
	static propTypes = {
		dnsTemplateConflicts: PropTypes.array,
		dnsTemplateRecords: PropTypes.array,
		isPlaceholder: PropTypes.bool
	};

	static defaultProps = {
		conflictingRecords: [],
		isPlaceholder: false
	};

	state = {
		recordsVisible: false
	};

	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span></span>
				<span></span>
			</div>
		);
	}

	renderDnsRecords = ( records ) => {
		return (
			<ul className="domain-connect__dns-list">
				{
					records.map( ( record, index ) => {
						return (
							<li key={ index }>
								<div className="domain-connect__dns-list-type">
									<label>{ record.type }</label>
								</div>
								<div className="domain-connect__dns-list-info">
									<strong>{ record.name }</strong>
									<em>{ record.data }</em>
								</div>
							</li>
						);
					} )
				}
			</ul>
		);
	}

	renderConflictingRecords = () => {
		const { dnsTemplateConflicts, translate } = this.props;

		if ( dnsTemplateConflicts && dnsTemplateConflicts.length && this.state.recordsVisible ) {
			return (
				<Card className="domain-connect__dns-records">
					<p>
						{ translate( 'We\'re going to remove or replace these records:' ) }
					</p>
					{ this.renderDnsRecords( dnsTemplateConflicts ) }
					<p>
						{ translate( 'The services that these records were used for may no longer work if they ' +
								'are removed. If you are trying to switch from one service provider to another ' +
								'this is probably what you want to do.' ) }
					</p>
				</Card>
			);
		}

		return null;
	}

	renderDnsTemplateRecords = () => {
		const { dnsTemplateRecords, translate } = this.props;

		if ( this.state.recordsVisible ) {
			return (
				<Card className="domain-connect__dns-records">
					<p>
						{ translate( 'We\'re going add these records:' ) }
					</p>
					{ this.renderDnsRecords( dnsTemplateRecords ) }
				</Card>
			);
		}

		return null;
	}

	toggleRecordsVisible = () => {
		this.setState( { recordsVisible: ! this.state.recordsVisible } );
	}

	render() {
		const { dnsTemplateRecords, isPlaceholder, translate } = this.props,
			showRecordsLinkText = this.state.recordsVisible ? translate( 'Hide Changes.' ) : translate( 'View Changes.' );

		if ( isPlaceholder ) {
			return this.placeholder();
		}

		if ( ! ( dnsTemplateRecords && dnsTemplateRecords.length ) ) {
			return null;
		}

		return (
			<div>
				<p>
					<span>
					{ translate( 'To set up this service, we\'re going to make some changes to the ' +
						'the DNS records for your domain.' ) }
					</span>&nbsp;
					<a onClick={ this.toggleRecordsVisible }>{ showRecordsLinkText }</a>
				</p>
				{ this.renderDnsTemplateRecords() }
				{ this.renderConflictingRecords() }
			</div>
		);
	}
}

export default localize( DomainConnectAuthorizeRecords );
