import site from './mock-site';
import earnings from './mock-earnings';
import settings from './mock-settings';

export default {
	fetchedEarnings: {
		type: 'RECEIVE_EARNINGS',
		site: site,
		error: null,
		data: earnings
	},

	fetchedSettings: {
		type: 'RECEIVE_WORDADS_SETTINGS',
		site: site,
		error: null,
		data: settings
	},

	fetchedTos: {
		type: 'RECEIVE_WORDADS_TOS',
		site: site,
		error: null,
		data: { tos: 'signed' }
	}
};
