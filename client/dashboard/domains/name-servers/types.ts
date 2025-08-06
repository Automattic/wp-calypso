export const MIN_NAMESERVER_LENGTH = 2;
export const MAX_NAMESERVER_LENGTH = 4;

export const WPCOM_DEFAULT_NAMESERVERS = [
	'ns1.wordpress.com',
	'ns2.wordpress.com',
	'ns3.wordpress.com',
];

export interface NameServerField {
	value: string;
	error: string;
	touched: boolean;
}

export type ServiceName = 'WordPress.com' | string;
