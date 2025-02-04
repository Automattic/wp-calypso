import { Action } from 'redux';
import { ACCOUNT_RESTORE } from '../action-types';

export interface AccountState {
	restoreToken?: string | null;
	isClosed?: boolean;
	isRestoring?: boolean;
}

export type AccountRestoreActionType = Action< typeof ACCOUNT_RESTORE > & {
	payload: {
		token: string;
	};
};
