export const MIN_NAMESERVER_LENGTH = 2;
export const MAX_NAMESERVER_LENGTH = 4;

export interface NameServerField {
	value: string;
	error: string;
	touched: boolean;
}
