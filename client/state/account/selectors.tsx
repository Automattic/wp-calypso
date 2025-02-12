import { AccountState } from './types';

export const getRestoreToken = ( state: { account?: AccountState } ) =>
	state.account?.restoreToken || null;

export const getIsRestoring = ( state: { account?: AccountState } ) =>
	state.account?.isRestoring || false;
