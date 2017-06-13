export const createState = ( { ui, site } ) => {
	return {
		extensions: {
			woocommerce: {
				sites: {
					123: site,
				},
				ui: {
					123: ui,
				},
			},
		},
		ui: {
			selectedSiteId: 123,
		},
	};
};
