import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

export interface SubscriberState {
	import?: {
		inProgress: boolean;
		job?: ImportJob;
		error?: ImportSubscribersError;
	};
	imports?: ImportJob[];
	hydrated?: boolean;
}

export type ImportJobStatus = 'pending' | 'importing' | 'imported' | 'failed';

export type ImportJob = {
	id: number;
	status: ImportJobStatus;
	email_count?: number;
	scheduled_at?: string;
	subscribed_count?: number;
};

export type GenericError = {
	code: string;
	message: string;
};

export type AddSubscriberError = { email: string } | GenericError;

export type ImportSubscribersError = Record< string, unknown > | GenericError;

export type ImportSubscribersResponse = {
	upload_id: number;
	errors: string[];
	subscribed: number;
};

export type GetSubscribersImportResponse = ImportJob;
export type GetSubscribersImportsResponse = ImportJob[];

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}
