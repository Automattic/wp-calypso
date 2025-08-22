import { ARecordConfig } from './a-record';
import { AAAARecordConfig } from './aaaa-record';
import { AliasRecordConfig } from './alias-record';
import { CAARecordConfig } from './caa-record';
import { CNAMERecordConfig } from './cname-record';
import { MXRecordConfig } from './mx-record';
import { NSRecordConfig } from './ns-record';
import { SRVRecordConfig } from './srv-record';
import { TXTRecordConfig } from './txt-record';
import type { DnsRecord, DnsRecordType } from '../../../data/domain-dns-records';
import type { Field } from '@wordpress/dataviews';

export type DnsRecordTypeFormData = {
	type: DnsRecordType;
};

export type DnsRecordFormData = {
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

export type DnsRecordConfig = {
	description?: string;
	fields: Field< DnsRecordFormData >[];
	form: {
		layout: { type: 'regular' };
		fields: string[];
	};
	// Function to transform the form data into the format expected by the DNS endpoint
	transformData: ( data: DnsRecordFormData, domainName?: string ) => DnsRecord;
};

export const DNS_RECORD_CONFIGS: Record< DnsRecordType, DnsRecordConfig > = {
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
