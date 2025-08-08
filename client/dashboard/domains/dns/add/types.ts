import { Field } from '@wordpress/dataviews';
import { DNSRecordType } from '../../../data/domain-dns-records';

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
	description: string;
	fields: Field< AddDNSRecordFormData >[];
	form: {
		type: 'regular';
		fields: string[];
	};
	transformData: ( data: AddDNSRecordFormData ) => Record< string, any >;
};
