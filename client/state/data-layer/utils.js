/**
 * Internal dependencies
 */
import { extendAction } from 'state/utils';

const doBypassDataLayer = {
	meta: {
		dataLayer: {
			doBypass: true,
		},
	},
};

export const local = action => extendAction( action, doBypassDataLayer );
