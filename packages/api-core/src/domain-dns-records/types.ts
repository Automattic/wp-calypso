export type DnsRecordType = 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';

export type DnsRecord = {
	aux?: number;
	data?: string;
	domain?: string;
	flags?: number;
	id?: string;
	name: string;
	port?: number;
	protected_field?: boolean;
	protocol?: string;
	service?: string;
	tag?: string;
	target?: string;
	ttl?: number;
	type: DnsRecordType;
	value?: string;
	weight?: number;
};

export type DnsResponse = {
	records: DnsRecord[];
};

export type DnsTemplateVariables = {
	domain: string;
	token: string;
	mxdata?: string;
};
