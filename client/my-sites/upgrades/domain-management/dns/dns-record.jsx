/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import endsWith from 'lodash/endsWith';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { isBeingProcessed } from 'lib/domains/dns';

const DnsRecord = React.createClass( {
	propTypes: {
		onDeleteDns: React.PropTypes.func.isRequired,
		dnsRecord: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	handledBy: function() {
		const { type, aux, port, service, weight, protocol } = this.props.dnsRecord,
			data = this.trimDot( this.props.dnsRecord.data ),
			target = this.trimDot( this.props.dnsRecord.target );

		if ( this.props.dnsRecord.protected_field ) {
			if ( 'MX' === type ) {
				return this.translate( 'Mail handled by WordPress.com email forwarding' );
			}

			return this.translate( 'Handled by WordPress.com' );
		}

		switch ( type ) {
			case 'A':
			case 'AAAA':
				return this.translate( 'Points to %(data)s', {
					args: {
						data
					}
				} );

			case 'CNAME':
				return this.translate( 'Alias of %(data)s', {
					args: {
						data
					}
				} );

			case 'MX':
				return this.translate( 'Mail handled by %(data)s with priority %(aux)s', {
					args: {
						data,
						aux
					}
				} );

			case 'SRV':
				return this.translate(
					'Service %(service)s (%(protocol)s) on target %(target)s:%(port)s, ' +
					'with priority %(aux)s and weight %(weight)s', {
						args: {
							service,
							protocol,
							target,
							port,
							aux,
							weight
						}
					}
				);
		}

		return data;
	},

	trimDot: function( str ) {
		return typeof str === 'string' ? str.replace( /\.$/, '' ) : str;
	},

	getName: function() {
		const { name, service, protocol, type } = this.props.dnsRecord,
			domain = this.props.selectedDomainName,
			isRoot = name === `${ domain }.`;

		if ( 'SRV' === type ) {
			return `_${ service }._${ protocol }.${ isRoot ? '' : name + '.' }${ domain }`;
		}

		if ( endsWith( name, '.' ) ) {
			return name.slice( 0, -1 );
		}

		return name ? `${ name }.${ domain }` : domain;
	},

	deleteDns: function() {
		// Delegate to callback from parent
		this.props.onDeleteDns( this.props.dnsRecord );
	},

	renderRemoveButton: function() {
		return (
			<Button borderless onClick={ this.deleteDns }>
				<Gridicon icon="trash" />
			</Button>
		);
	},

	render: function() {
		const { dnsRecord } = this.props,
			classes = classNames( { 'is-disabled': isBeingProcessed( dnsRecord ) } ),
			isAllowedToBeRemoved = ! this.props.dnsRecord.protected_field || 'MX' === this.props.dnsRecord.type;
		return (
			<li className={ classes }>
				<div className="dns__list-type">
					<label>{ this.props.dnsRecord.type }</label>
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
} );

export default DnsRecord;
