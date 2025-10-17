import { wpcom } from '../wpcom-fetcher';
import type { AccountRecovery } from './types';

export async function fetchAccountRecovery(): Promise< AccountRecovery > {
	return wpcom.req.get( '/me/account-recovery' );
}
