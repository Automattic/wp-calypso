import { setDnsDefaultARecords } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { AnyAction, Dispatch } from 'redux';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnpackPromisedValue< T > = T extends ( ...args: any[] ) => infer R
	? R extends ( dispatch: Dispatch< AnyAction > ) => infer ActionType
		? ( ...args: Parameters< T > ) => Promise< ActionType >
		: ( ...args: Parameters< T > ) => Promise< R >
	: T;

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
	dispatchSetDnsDefaultARecords: UnpackPromisedValue< typeof setDnsDefaultARecords >;
	dispatchSuccessNotice: UnpackPromisedValue< typeof successNotice >;
	dispatchErrorNotice: UnpackPromisedValue< typeof errorNotice >;
};

export type RestoreDialogResult = {
	shouldRestoreDefaultRecords: boolean;
};

export type DndAddNewRecordButtonProps = {
	site: string;
	domain: string;
};
