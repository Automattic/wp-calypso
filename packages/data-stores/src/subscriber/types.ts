import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

export interface SubscriberState {
	add?: {
		inProgress: boolean;
		response: AddSubscribersResponse;
	};
	import?: {
		inProgress: boolean;
		file?: File;
		emails?: string[];
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

export type AddSubscribersResponse = {
	subscribed: number;
	errors: AddSubscriberError[];
};

export type ImportSubscribersError = Record< string, unknown > | GenericError;

export type ImportSubscribersResponse = {
	upload_id: number;
};

export type GetSubscribersImportResponse = ImportJob;
export type GetSubscribersImportsResponse = ImportJob[];

export interface SubscriberDispatch {
	dispatch: DispatchFromMap< typeof actions >;
}
