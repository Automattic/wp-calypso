/**
 * Internal dependencies
 */
import { isNewUser } from 'state/ui/guided-tours/selectors';
import { getSectionName } from 'state/ui/selectors';

const tours = {
	main: {
		meta: {
			version: 'test',
			path: '/',
			context: state => isNewUser( state ),
		},
		init: {
			text: "Need a hand? We'd love to show you around the place.",
			type: 'FirstStep',
			placement: 'right',
		},
	},
	themes: {
		meta: {
			version: 'test',
			path: '/design',
			context: () => true,
		},
		description: 'Learn how to find and activate a theme',
		showInContext: state => getSectionName( state ) === 'themes',
		init: {
			text: 'Hey there! Want me to show you how to find a great theme for your site?',
			type: 'FirstStep',
			placement: 'right',
		},
	},
	test: {
		meta: {
			version: 'test',
			path: '/test',
			context: () => true,
		},
	},
};

export default {
	get: tour => tours[ tour ] || null,
	getAll: () => tours,
};
