import { useTranslate } from 'i18n-calypso';
import { DnsRecordItemProps } from './types';

const DnsRecordItem = ( { dnsRecord, selectedDomainName }: DnsRecordItemProps ): JSX.Element => {
	const translate = useTranslate();

	const trimDot = ( str?: string ) => {
		return str ? str.replace( /\.$/, '' ) : '';
	};

	const handledBy = () => {
		const { type, aux, port, weight } = dnsRecord;
		const data = trimDot( dnsRecord.data );
		const target = trimDot( dnsRecord.target );

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
	};

	const getName = () => {
		const { name, service, protocol, type } = dnsRecord;

		if ( name.replace( /\.$/, '' ) === selectedDomainName ) {
			return '@';
		}

		if ( 'SRV' === type ) {
			return `_${ service }._${ protocol }.${ name }`;
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
