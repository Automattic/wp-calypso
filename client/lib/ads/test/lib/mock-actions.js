/**
 * Internal dependencies
 */

import site from './mock-site';
import settings from './mock-settings';

export default {
	fetchedSettings: {
		type: 'RECEIVE_WORDADS_SETTINGS',
		site: site,
		error: null,
		data: settings,
	},

	fetchedTos: {
		type: 'RECEIVE_WORDADS_TOS',
		site: site,
		error: null,
		data: { tos: 'signed' },
	},
};
