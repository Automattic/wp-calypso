import { THEME_SHOW_ATOMIC_TRANSFER_DIALOG } from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

export function showAtomicTransferDialog( themeId ) {
	return {
		type: THEME_SHOW_ATOMIC_TRANSFER_DIALOG,
		themeId,
	};
}
