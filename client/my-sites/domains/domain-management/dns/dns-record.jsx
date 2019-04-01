/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { endsWith } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { isBeingProcessed } from 'lib/domains/dns';

class DnsRecord extends React.Component {
	static propTypes = {
		onDeleteDns: PropTypes.func.isRequired,
		dnsRecord: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	};

	handledBy() {
		const { dnsRecord, translate } = this.props;
		const { type, aux, port, service, weight, protocol } = dnsRecord;
		const data = this.trimDot( dnsRecord.data );
		const target = this.trimDot( dnsRecord.target );

		if ( dnsRecord.protected_field ) {
			if ( 'MX' === type ) {
				return translate( 'Mail handled by WordPress.com email forwarding' );
			}

			return translate( 'Handled by WordPress.com' );
		}

		switch ( type ) {
			case 'A':
			case 'AAAA':
				return translate( 'Points to %(data)s', {
					args: {
						data,
					},
				} );

			case 'CNAME':
				return translate( 'Alias of %(data)s', {
					args: {
						data,
					},
				} );

			case 'MX':
				return translate( 'Mail handled by %(data)s with priority %(aux)s', {
					args: {
						data,
						aux,
					},
				} );

			case 'SRV':
				return translate(
					'Service %(service)s (%(protocol)s) on target %(target)s:%(port)s, ' +
						'with priority %(aux)s and weight %(weight)s',
					{
						args: {
							service,
							protocol,
							target,
							port,
							aux,
							weight,
						},
					}
				);
		}

		return data;
	}

	trimDot( str ) {
		return typeof str === 'string' ? str.replace( /\.$/, '' ) : str;
	}

	getName() {
		const { name, service, protocol, type } = this.props.dnsRecord;
		const domain = this.props.selectedDomainName;
		const isRoot = name === `${ domain }.`;

		if ( 'SRV' === type ) {
			return `_${ service }._${ protocol }.${ isRoot ? '' : name + '.' }${ domain }`;
		}

		if ( endsWith( name, '.' ) ) {
			return name.slice( 0, -1 );
		}

		return name ? `${ name }.${ domain }` : domain;
	}

	deleteDns = () => {
		// Delegate to callback from parent
		this.props.onDeleteDns( this.props.dnsRecord );
	};

	renderRemoveButton() {
		return (
			<Button borderless onClick={ this.deleteDns }>
				<Gridicon icon="trash" />
			</Button>
		);
	}

	render() {
		const { dnsRecord } = this.props;
		const isDisabled = isBeingProcessed( dnsRecord );
		const isAllowedToBeRemoved = ! dnsRecord.protected_field || 'MX' === dnsRecord.type;

		return (
			<li className={ classNames( 'dns__list-item', { 'is-disabled': isDisabled } ) }>
				<div className="dns__list-type">
					<span>{ dnsRecord.type }</span>
				</div>
				<div className="dns__list-info">
					<strong>{ this.getName() }</strong>
					<em>{ this.handledBy() }</em>
				</div>
				<div className="dns__list-remove">
					{ isAllowedToBeRemoved && this.renderRemoveButton() }
				</div>
			</li>
		);
	}
}

export default localize( DnsRecord );
