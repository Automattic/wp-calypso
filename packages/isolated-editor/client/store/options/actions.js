const actions = {
	/**
	 * Toggle the option
	 * @param {string} option Option name
	 */
	toggleOption( option ) {
		return {
			type: 'TOGGLE_OPTION',
			option,
		};
	},
};

export default actions;
