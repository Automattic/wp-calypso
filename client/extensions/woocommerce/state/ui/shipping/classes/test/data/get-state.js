/** @format */

/**
 * Internal dependencies
 */

import initialShippingClasses from 'woocommerce/state/sites/shipping-classes/test/data/initial-state';

export default ( uiClasses = {} ) => {
	return {
		extensions: {
			woocommerce: {
				sites: {
					[ 123 ]: {
						shippingClasses: initialShippingClasses,
					},
				},
				ui: {
					shipping: {
						[ 123 ]: {
							classes: {
								editing: false,
								editingClass: null,
								changes: {},
								created: [],
								deleted: [],
								updates: [],
								...uiClasses,
							},
						},
					},
				},
			},
		},
	};
};
