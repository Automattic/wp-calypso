import config from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { Icon, edit, redo, backup, trash, disable, info } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import MaterialIcon from 'calypso/components/material-icon';
import DnsRecordListItem from '../dns-records/item';
import DnsRecordsListItem from './dns-records-list-item';

class DnsRecordData extends Component {
	static propTypes = {
		actions: PropTypes.array.isRequired,
		dnsRecord: PropTypes.object.isRequired,
		enabled: PropTypes.bool,
		onDeleteDns: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		enabled: true,
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

		if ( name.endsWith( '.' ) ) {
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
			<div className="dns__list-remove">
				<Button borderless onClick={ this.deleteDns }>
					<Gridicon icon="trash" />
				</Button>
			</div>
		);
	}

	render() {
		const { actions, dnsRecord, enabled, translate } = this.props;
		const disabled = dnsRecord.isBeingDeleted || dnsRecord.isBeingAdded || ! enabled;

		return (
			<DnsRecordsListItem
				disabled={ disabled }
				type={ dnsRecord.type }
				name={ this.getName() }
				value={ this.handledBy() }
				record={ dnsRecord }
				actions={ actions }
			/>
		);
	}
}

export default localize( DnsRecordData );
