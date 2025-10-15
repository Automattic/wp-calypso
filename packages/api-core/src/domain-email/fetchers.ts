import { wpcom } from '../wpcom-fetcher';

type EmailForwarder = {
	email: string;
	mailbox: string;
	domain: string;
	forward_address: string;
	active: boolean;
	created: number;
};

type EmailForwardersResult = {
	type: 'forward';
	forwards: EmailForwarder[];
	mx_servers: null | string[];
	max_forwards: number;
};

export async function fetchEmailForwarders( domain: string ): Promise< EmailForwardersResult > {
	return wpcom.req.get( `/domains/${ encodeURIComponent( domain ) }/email` );
}
