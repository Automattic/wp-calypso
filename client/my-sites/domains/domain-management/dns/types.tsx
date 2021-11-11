import { setDnsDefaultARecords } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export type DnsRecord = {
	id: string;
	name: string;
	type: string;
	domain: string;
	protected_field?: boolean;
	active?: string;
	data?: string;
	ttl?: number;
	rdata?: string;
};

export type DnsMenuOptionsButtonProps = {
	domain: string;
	pointsToWpcom: boolean;
	dispatchSetDnsDefaultARecords: typeof setDnsDefaultARecords;
	dispatchSuccessNotice: typeof successNotice;
	dispatchErrorNotice: typeof errorNotice;
};

export type RestoreDialogResult = {
	shouldRestoreDefaultRecords: boolean;
};

export type DndAddNewRecordButtonProps = {
	site: string;
	domain: string;
};
