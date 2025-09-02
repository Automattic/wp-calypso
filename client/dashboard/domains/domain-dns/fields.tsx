import { __, sprintf } from '@wordpress/i18n';
import type { DnsRecord } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const trimDot = ( str?: string ) => {
	return str ? str.replace( /\.$/, '' ) : '';
};

export function useDnsFields( domainName: string ): Field< DnsRecord >[] {
	return [
		{
			id: 'type',
			label: __( 'Type' ),
			enableHiding: false,
			enableSorting: true,
			getValue: ( { item } ) => item.type,
		},
		{
			id: 'name',
			label: __( 'Name' ),
			enableHiding: false,
			enableSorting: true,
			getValue: ( { item } ) => {
				const { name, service, protocol, type } = item;

				if ( 'SRV' === type ) {
					return `${ service }.${ protocol }.${
						name.replace( /\.$/, '' ) === domainName ? name : name + '.' + domainName + '.'
					}`;
				}

				if ( name.replace( /\.$/, '' ) === domainName ) {
					return '@';
				}

				return name;
			},
		},
		{
			id: 'value',
			label: __( 'Value' ),
			enableHiding: false,
			enableSorting: true,
			getValue: ( { item } ) => {
				const { type, aux, port, weight } = item;
				const data = trimDot( item.data );
				const target = '.' !== item.target ? trimDot( item.target ) : '.';
				if ( item.protected_field ) {
					if ( 'MX' === type ) {
						return __( 'Mail handled by WordPress.com email forwarding' );
					}
					return __( 'Handled by WordPress.com' );
				}

				switch ( type ) {
					case 'MX':
						return sprintf(
							// translators: %(data)s is a hostname, %(aux)d is a priority
							__( '%(data)s with priority %(aux)d' ),
							{
								data,
								aux: aux as number,
							}
						);
					case 'SRV':
						return sprintf(
							// translators: %(target)s is a hostname, %(port)d is a port, %(aux)d is a priority, %(weight)d is a weight
							__( '%(target)s:%(port)d, with priority %(aux)d and weight %(weight)d' ),
							{
								target,
								port: port as number,
								aux: aux as number,
								weight: weight as number,
							}
						);
				}
				return data;
			},
			render: ( { field, item } ) => (
				<div style={ { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }>
					{ field.getValue( { item } ) }
				</div>
			),
		},
	];
}
