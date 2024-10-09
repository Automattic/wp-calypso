import {
	DNS_RECORDS_DEFAULT,
	DNS_RECORDS_DEFAULT_MX,
	DNS_RECORDS_DEFAULT_A,
	DNS_RECORDS_DEFAULT_CNAME,
} from '@automattic/urls';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ExternalLink from 'calypso/components/external-link';
import DnsRecordsListItem from './dns-records-list-item';

class DnsRecordData extends Component {
	static propTypes = {
		actions: PropTypes.array.isRequired,
		dnsRecord: PropTypes.object.isRequired,
		enabled: PropTypes.bool,
		selectedDomainName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		enabled: true,
	};

	handledBy() {
		const { dnsRecord, translate } = this.props;
		const { type, aux, port, weight } = dnsRecord;
		const data = this.trimDot( dnsRecord.data );
		const target = dnsRecord.target !== '.' ? this.trimDot( dnsRecord.target ) : '.';

		// TODO: Remove this once we stop displaying the protected records
		if ( dnsRecord.protected_field ) {
			let url = DNS_RECORDS_DEFAULT;
			switch ( type ) {
				case 'MX':
					url = DNS_RECORDS_DEFAULT_MX;
					break;
				case 'A':
					url = DNS_RECORDS_DEFAULT_A;
					break;
				case 'CNAME':
					url = DNS_RECORDS_DEFAULT_CNAME;
					break;
			}

			if ( 'MX' === type ) {
				return translate(
					'Mail handled by WordPress.com email forwarding. {{supportLink}}Learn more{{/supportLink}}.',
					{
						components: {
							supportLink: <ExternalLink href={ url } target="_blank" icon={ false } />,
						},
					}
				);
			}

			return translate( 'Handled by WordPress.com. {{supportLink}}Learn more{{/supportLink}}.', {
				components: {
					supportLink: <ExternalLink href={ url } target="_blank" icon={ false } />,
				},
			} );
		}

		switch ( type ) {
			case 'MX':
				return translate( '%(data)s with priority %(aux)d', {
					args: {
						data,
						aux,
					},
					comment: '%(data)s is a hostname',
				} );

			case 'SRV':
				return translate( '%(target)s:%(port)d, with priority %(aux)d and weight %(weight)d', {
					args: {
						target,
						port,
						aux,
						weight,
						comment: '%(target)s is a hostname',
					},
				} );
		}

		return data;
	}

	trimDot( str ) {
		return typeof str === 'string' ? str.replace( /\.$/, '' ) : str;
	}

	getName() {
		const { name, service, protocol, type } = this.props.dnsRecord;
		const domain = this.props.selectedDomainName;

		if ( 'SRV' === type ) {
			return `${ service }.${ protocol }.${
				name.replace( /\.$/, '' ) === domain ? name : name + '.' + domain + '.'
			}`;
		}

		if ( name.replace( /\.$/, '' ) === domain ) {
			return '@';
		}

		return name;
	}

	render() {
		const { actions, dnsRecord, enabled } = this.props;
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
