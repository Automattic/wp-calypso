/** @format */

/**
 * Internal dependencies
 */

import { extendAction } from 'client/state/utils';

const doBypassDataLayer = {
	meta: {
		dataLayer: {
			doBypass: true,
		},
	},
};

export const bypassDataLayer = action => extendAction( action, doBypassDataLayer );
