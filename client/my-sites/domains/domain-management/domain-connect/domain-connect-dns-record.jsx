/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { endsWith } from 'lodash';

/**
 * Internal dependencies
 */
import DnsRecordsListItem from '../dns-records/item';

class DomainConnectDnsRecord extends Component {
	static propTypes = {
		index: PropTypes.number,
		domain: PropTypes.string,
		dnsRecord: PropTypes.object,
	};

	getName = ( record ) => {
		const { name, service, protocol, type } = record;
		const { domain } = this.props;
		const isRoot = name === `${ domain }.`;

		if ( 'SRV' === type ) {
			return `${ service }.${ protocol }.${ isRoot ? '' : name + '.' }${ domain }`;
		}

		if ( endsWith( name, '.' ) ) {
			return name.slice( 0, -1 );
		}

		return name ? `${ name }.${ domain }` : domain;
	};

	trimDot( str ) {
		return typeof str === 'string' ? str.replace( /\.$/, '' ) : str;
	}

	handledBy = ( record ) => {
		const { translate } = this.props;
		const { type, aux, port, service, weight, protocol } = record;
		const data = this.trimDot( record.data );
		const target = this.trimDot( record.target );

		if ( record.protected_field ) {
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
	};

	render() {
		const record = this.props.dnsRecord;

		return (
			<DnsRecordsListItem
				type={ record.type }
				name={ this.getName( record ) }
				content={ this.handledBy( record ) }
			/>
		);
	}
}

export default localize( DomainConnectDnsRecord );
