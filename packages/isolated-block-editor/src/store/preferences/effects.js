const effects = {
	TOGGLE_FEATURE( action, store ) {
		const { getState } = store;
		const { preferences, editor } = getState();

		// Save the feature to `localStorage`
		if ( editor.settings.preferencesKey && window?.localStorage ) {
			window.localStorage.setItem( editor.settings.preferencesKey, JSON.stringify( preferences ) );
		}
	},
};

export default effects;
