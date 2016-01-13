/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';

var DnsRecord = React.createClass( {
	propTypes: {
		deleteDns: React.PropTypes.func.isRequired,
		dnsRecord: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired
	},

	handledBy: function() {
		var { type, data, aux, target, port, service, weight, protocol } = this.props.dnsRecord;

		data = this.trimDot( data );
		target = this.trimDot( target );

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
						data: data
					}
				} );

			case 'CNAME':
				return this.translate( 'Alias of %(data)s', {
					args: {
						data: data
					}
				} );

			case 'MX':
				return this.translate( 'Mail handled by %(data)s with priority %(aux)s', {
					args: {
						data: data,
						aux: aux
					}
				} );

			case 'SRV':
				return this.translate( 'Service %(service)s (%(protocol)s) on target %(target)s:%(port)s, with priority %(aux)s and weight %(weight)s', {
					args: {
						service,
						protocol,
						target,
						port,
						aux,
						weight
					}
				} );
		}

		return data;
	},

	trimDot: function( str ) {
		return typeof str === 'string' ? str.replace( /\.$/, '' ) : str;
	},

	getName: function() {
		var { name, service, protocol } = this.props.dnsRecord,
			domain = this.props.selectedDomainName,
			isRoot = name === domain + '.';

		if ( 'SRV' === this.props.dnsRecord.type ) {
			return service + '_' + protocol + '.' + ( isRoot ? name + '.' : '' ) + domain;
		}

		return isRoot ? domain : name + '.' + domain;
	},

	isBeingProcessed: function() {
		return this.props.dnsRecord.isBeingDeleted || this.props.dnsRecord.isBeingAdded;
	},

	deleteDns: function() {
		if ( this.isBeingProcessed() ) {
			return;
		}
		this.props.deleteDns( this.props.dnsRecord );
	},

	render: function() {
		const classes = classNames( { 'is-disabled': this.isBeingProcessed() } );
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
					{ ! this.props.dnsRecord.protected_field || 'MX' === this.props.dnsRecord.type ?
						<Button borderless onClick={ this.deleteDns }>
							<Gridicon icon="trash" />
						</Button> : null }
				</div>
			</li>
		);
	}
} );

module.exports = DnsRecord;
