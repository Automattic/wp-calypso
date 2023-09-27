import { useTranslate } from 'i18n-calypso';
import { DnsRecordItemProps } from './types';

const DnsRecordItem = ( { dnsRecord, selectedDomainName }: DnsRecordItemProps ) => {
	const translate = useTranslate();
	const trimDot = ( str?: string ) => {
		return str ? str.replace( /\.$/, '' ) : '';
	};

	const handledBy = () => {
		const { type, aux, port, weight } = dnsRecord;
		const data = trimDot( dnsRecord.data );
		const target = '.' !== dnsRecord.target ? trimDot( dnsRecord.target ) : '.';

		// TODO: Remove this once we stop displaying the protected records
		if ( dnsRecord.protected_field ) {
			if ( 'MX' === type ) {
				return translate( 'Mail handled by WordPress.com email forwarding' );
			}

			return translate( 'Handled by WordPress.com' );
		}

		switch ( type ) {
			case 'MX':
				return translate( '%(data)s with priority %(aux)d', {
					args: {
						data,
						aux: aux as number,
					},
					comment: '%(data)s is a hostname',
				} );

			case 'SRV':
				return translate( '%(target)s:%(port)d, with priority %(aux)d and weight %(weight)d', {
					args: {
						target,
						port: port as number,
						aux: aux as number,
						weight: weight as number,
						comment: '%(target)s is a hostname',
					},
				} );
		}

		return data;
	};

	const getName = () => {
		const { name, service, protocol, type } = dnsRecord;

		if ( 'SRV' === type ) {
			return `${ service }.${ protocol }.${
				name.replace( /\.$/, '' ) === selectedDomainName
					? name
					: name + '.' + selectedDomainName + '.'
			}`;
		}

		if ( name.replace( /\.$/, '' ) === selectedDomainName ) {
			return '@';
		}

		return name;
	};

	return (
		<div className="dns-record-item">
			<div className="dns-record-item__type">{ dnsRecord.type }</div>
			<div className="dns-record-item__name">{ getName() }</div>
			<div className="dns-record-item__value">{ handledBy() }</div>
		</div>
	);
};

export default DnsRecordItem;
