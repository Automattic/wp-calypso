const effects = {
	TOGGLE_FEATURE( action, store ) {
		const { getState } = store;
		const { preferences, editor } = getState();

		// Save the feature to `localStorage`
		if ( editor.settings.preferencesKey ) {
			localStorage.setItem( editor.settings.preferencesKey, JSON.stringify( preferences ) );
		}
	},
};

export default effects;
