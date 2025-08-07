import { ARecordConfig } from './a-record';
import { AAAARecordConfig } from './aaaa-record';
import { AliasRecordConfig } from './alias-record';
import { CAARecordConfig } from './caa-record';
import { CNAMERecordConfig } from './cname-record';
import { MXRecordConfig } from './mx-record';
import { NSRecordConfig } from './ns-record';
import { SRVRecordConfig } from './srv-record';
import { TXTRecordConfig } from './txt-record';
import type { DNSRecordType, DNSRecordConfig } from './types';

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

export * from './types';
