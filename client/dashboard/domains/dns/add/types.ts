import { Field } from '@wordpress/dataviews';

export type DNSRecordType = 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'NS' | 'SRV' | 'TXT';

export type DNSRecordTypeFormData = {
	type: DNSRecordType;
};

export type AddDNSRecordFormData = {
	type: DNSRecordType;
	name: string;
	data: string;
	ttl: number;
	flags: number; // CAA
	tag: string; // CAA
	aux: number; // MX, SRV
	service: string; // SRV
	protocol: string; // SRV
	weight: number; // SRV
	target: string; // SRV
	port: number; // SRV
};

export type DNSRecordConfig = {
	fields: Field< AddDNSRecordFormData >[];
	form: {
		type: 'regular';
		fields: string[];
	};
	transformData: ( data: AddDNSRecordFormData ) => Record< string, any >;
};
