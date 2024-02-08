import { applyDnsTemplate, updateDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { AnyAction, Dispatch } from 'redux';

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

export type ImportedDnsRecord = DnsRecord & {
	selected: boolean;
};

type Dns = {
	isFetching: boolean;
	hasLoadedFromServer: boolean;
	isSubmittingForm: boolean;
	records: DnsRecord[];
};

type UnpackPromisedValue< T > = T extends ( ...args: unknown[] ) => infer R
	? R extends ( dispatch: Dispatch< AnyAction > ) => infer ActionType
		? ( ...args: Parameters< T > ) => Promise< ActionType >
		: ( ...args: Parameters< T > ) => Promise< R >
	: T;

export type DnsMenuOptionsButtonProps = {
	domain: ResponseDomain | undefined;
	hasDefaultARecords: boolean;
	hasDefaultCnameRecord: boolean;
	hasDefaultEmailRecords: boolean;
	dns: Dns;
	dispatchApplyDnsTemplate: UnpackPromisedValue< typeof applyDnsTemplate >;
	dispatchUpdateDns: UnpackPromisedValue< typeof updateDns >;
	dispatchSuccessNotice: typeof successNotice;
	dispatchErrorNotice: typeof errorNotice;
};

export type DnsTemplateDetails = {
	PROVIDER: string;
	SERVICE: string;
};

export type RestoreDialogResult = {
	shouldRestoreDefaultRecords: boolean;
};

export type RestoreEmailDnsDialogResult = {
	shouldRestoreEmailDns: boolean;
};

export type DndAddNewRecordButtonProps = {
	site: string;
	domain: string;
	isMobile?: boolean;
};

export type DnsImportBindFileButtonProps = {
	domain: string;
	isMobile?: boolean;
};
