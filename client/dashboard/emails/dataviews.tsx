import type { View } from '@wordpress/dataviews';

export { emailFields } from './fields';

export const DEFAULT_EMAILS_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 10,
	sort: { field: 'emailAddress', direction: 'asc' },
	fields: [ 'domainName', 'type', 'status' ],
	titleField: 'emailAddress',
};

export { useEmailActions } from './actions';
