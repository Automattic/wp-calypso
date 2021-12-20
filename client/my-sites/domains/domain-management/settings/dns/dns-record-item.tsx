import { useTranslate } from 'i18n-calypso';
import { DnsRecordItemProps } from './types';

const DnsRecordItem = ( { dnsRecord, selectedDomainName }: DnsRecordItemProps ): JSX.Element => {
	const translate = useTranslate();

	const trimDot = ( str: unknown ) => {
		return typeof str === 'string' ? str.replace( /\.$/, '' ) : str;
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
		<div>
			{ dnsRecord.type } - { getName() } - { handledBy() }
		</div>
	);
};

export default DnsRecordItem;
