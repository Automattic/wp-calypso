/**
 * Internal dependencies
 */
import order from '../../../test/fixtures/order';

export const refunds = [
	{
		id: 726,
		date_created: '2017-03-21T17:07:11',
		date_created_gmt: '2017-03-21T20:07:11',
		amount: '10.00',
		reason: '',
		refunded_by: 1,
	},
	{
		id: 724,
		date_created: '2017-03-21T16:55:37',
		date_created_gmt: '2017-03-21T19:55:37',
		amount: '9.00',
		reason: '',
		refunded_by: 1,
	},
];

export default {
	sites: {
		'site.one': {
			orders: {
				isLoading: {},
				items: {},
				refunds: {},
			},
		},
		'site.two': {
			orders: {
				isLoading: {
					40: false,
				},
				items: {
					40: order,
				},
				refunds: {
					40: {
						isSaving: null,
						items: refunds,
					},
				},
			},
		},
		'site.three': {
			orders: {
				isLoading: {
					1: false,
				},
				items: {
					1: order,
				},
				refunds: {
					1: {
						isSaving: true,
						items: [],
					},
				},
			},
		},
	},
};
