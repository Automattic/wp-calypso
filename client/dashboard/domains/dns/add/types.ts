import { Field } from '@wordpress/dataviews';
import { DNSRecord, DNSRecordType } from '../../../data/domain-dns-records';
import { ARecordConfig } from './a-record';
import { AAAARecordConfig } from './aaaa-record';
import { AliasRecordConfig } from './alias-record';
import { CAARecordConfig } from './caa-record';
import { CNAMERecordConfig } from './cname-record';
import { MXRecordConfig } from './mx-record';
import { NSRecordConfig } from './ns-record';
import { SRVRecordConfig } from './srv-record';
import { TXTRecordConfig } from './txt-record';

export type DNSRecordTypeFormData = {
	type: DNSRecordType;
};

export type DNSRecordFormData = {
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
	description?: string;
	fields: Field< DNSRecordFormData >[];
	form: {
		type: 'regular';
		fields: string[];
	};
	// Function to transform the form data into the format expected by the DNS endpoint
	transformData: ( data: DNSRecordFormData ) => DNSRecord;
};

export const DNS_RECORD_CONFIGS: Record< DNSRecordType, DNSRecordConfig > = {
	A: ARecordConfig,
	AAAA: AAAARecordConfig,
	ALIAS: AliasRecordConfig,
	CAA: CAARecordConfig,
	CNAME: CNAMERecordConfig,
	MX: MXRecordConfig,
	NS: NSRecordConfig,
	SRV: SRVRecordConfig,
	TXT: TXTRecordConfig,
};
