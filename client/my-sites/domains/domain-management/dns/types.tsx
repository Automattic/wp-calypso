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
	onSuccess: ( records: DnsRecord[] ) => void;
	onError: ( message: string ) => void;
};

export type RestoreDialogResult = {
	shouldRestoreDefaultRecords: boolean;
};

export type DndAddNewRecordButtonProps = {
	site: string;
	domain: string;
};
