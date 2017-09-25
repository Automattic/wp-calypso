/**
 * Internal dependencies
 */
import site from '../../fixtures/site';

const Actions = {

	removeNotices: {
		type: 'REMOVE_SITES_NOTICES',
		logs: [
			{
				status: 'error',
				action: 'DISCONNECT_SITE',
				site: site,
				error: { error: 'unauthorized_access' }
			}
		]
	}

};

export default Actions;
