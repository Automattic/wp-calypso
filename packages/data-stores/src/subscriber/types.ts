import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

export interface SubscriberState {
	add?: {
		inProgress: boolean;
		response: AddSubscribersResponse;
	};
	import?: {
		inProgress: boolean;
		error?: ImportSubscribersError;
	};
	imports?: ImportJob[];
}

export type ImportJobStatus = 'pending' | 'importing' | 'imported' | 'failed';

export type ImportJob = {
	id: number;
	status: ImportJobStatus;
	email_count: number;
	scheduled_at: string;
	subscribed_count: number;
};

export type GenericError = {
	code: string;
	message: string;
};

export type AddSubscriberError =
	| {
			email: string;
	  }
	| GenericError;

export type AddSubscribersResponse = {
	subscribed: number;
	errors: AddSubscriberError[];
};

export type ImportSubscribersError = Record< string, unknown > | GenericError;

export type ImportSubscribersResponse = Record< string, unknown >;

export type GetSubscribersImportResponse = ImportJob;
export type GetSubscribersImportsResponse = ImportJob[];

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}
