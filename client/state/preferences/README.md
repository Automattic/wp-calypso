# Preferences

This store holds preferences specific to Calypso.
They are persisted in `calypso_preferences` key of `/me/settings`.

## Usage

1. Render `QueryPreferences` from `components/data/query-preferences`
2. Connect your component specifying proper option keys:

   ```js
   export default connect(
   	( state ) => {
   		return {
   			editorModePreference: getPreference( state, 'editor-mode' ),
   		};
   	},
   	( dispatch ) => {
   		return bindActionCreators(
   			{
   				saveEditorModePreference: savePreference.bind( null, 'editor-mode' ),
   			},
   			dispatch
   		);
   	}
   )( PostEditor );
   ```

## Adding new preference key

When adding a new preference key, you may want to specify a default value and/or a schema to validate its expected values.

Schemas for persisted preference keys should be defined in the [`schema.js`](./schema.js) JSON schema.

Default values can be defined in the [`constants.js`](./constants.js) `DEFAULT_PREFERENCE_VALUES` mapping.

## Local and persisted preferences

Sometimes you only need a preference to last the duration of the current browser session. For these cases, use the `setPreference` action creator.

Otherwise, if you want the preference to be saved to the user's account settings, use the `savePreference` action creator.

When retrieving a value from state using the `getPreference` selector, it will first attempt to find a value in the local preferences state, next checking for a persisted value, then falling back to any applicable default before finally returning `null` if the preference could not be found.
