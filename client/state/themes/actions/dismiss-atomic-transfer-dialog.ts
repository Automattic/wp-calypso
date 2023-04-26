import { THEME_DISMISS_ATOMIC_TRANSFER_DIALOG } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function dismissAtomicTransferDialog() {
	return {
		type: THEME_DISMISS_ATOMIC_TRANSFER_DIALOG,
	};
}
