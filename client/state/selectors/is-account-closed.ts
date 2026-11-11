import type { AppState } from 'calypso/types';

import 'calypso/state/account/init';

export default function isAccountClosed( state: AppState ): boolean {
	return state?.account?.isClosed ?? false;
}
