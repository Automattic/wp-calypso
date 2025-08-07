export const MIN_NAME_SERVERS_LENGTH = 2;
export const MAX_NAME_SERVERS_LENGTH = 4;

export const WPCOM_DEFAULT_NAME_SERVERS = [
	'ns1.wordpress.com',
	'ns2.wordpress.com',
	'ns3.wordpress.com',
];

export interface NameServerField {
	value: string;
	error: string;
	touched: boolean;
}
