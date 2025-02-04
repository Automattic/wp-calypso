import { THEME_ACCEPT_ATOMIC_TRANSFER_DIALOG } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function acceptAtomicTransferDialog( themeId: string ) {
	return {
		type: THEME_ACCEPT_ATOMIC_TRANSFER_DIALOG,
		themeId,
	};
}
