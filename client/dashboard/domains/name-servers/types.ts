export const MIN_NAME_SERVERS_LENGTH = 2;
export const MAX_NAME_SERVERS_LENGTH = 4;

// Create a union type of numbers from 1 to MAX_NAME_SERVERS_LENGTH
export type Range< N extends number, T extends number[] = [] > = T[ 'length' ] extends N
	? T[ number ]
	: Range< N, [ ...T, T[ 'length' ] ] >;

export type NameServerKey = `nameServer${ Range< typeof MAX_NAME_SERVERS_LENGTH > }`;

export type FormData = {
	useWpcomNameServers: boolean;
} & {
	[ K in NameServerKey ]: string;
};

export interface NameServerField {
	value: string;
	error: string;
	touched: boolean;
}
