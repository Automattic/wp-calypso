/**
 * External dependencies
 */

import { mapValues } from 'lodash';

export const createState = ( { ui, site } ) => {
	return {
		extensions: {
			woocommerce: {
				sites: {
					123: site,
				},
				ui: {
					...mapValues( ui, ( branch ) => ( { 123: branch } ) ),
				},
			},
		},
		ui: {
			selectedSiteId: 123,
		},
	};
};
