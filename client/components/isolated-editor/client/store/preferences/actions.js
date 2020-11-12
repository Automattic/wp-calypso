const actions = {
	/**
	 * Toggle the feature
	 * @param {string} feature - Feature name
	 */
	toggleFeature( feature ) {
		return {
			type: 'TOGGLE_FEATURE',
			feature,
		};
	},
};

export default actions;
