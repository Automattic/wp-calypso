Preferences
========

This store holds preferences specific to Calypso.
They are persisted in `calypso_preferences` key of `/me/settings`.

# Usage

1. Render `QueryPreferences` from `components/data/query-preferences`
2. Connect your component specifying proper option keys:
```
export default connect(
	( state ) => {
		return {
			editorModePreference: getPreference( state, 'editor-mode' ),
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			saveEditorModePreference: savePreference.bind( null, 'editor-mode' ),
		}, dispatch );
	},
)( PostEditor );
```


## Adding new preference key

To add a new preference key, you only need to add a key and defaut value in `DEFAULT_PREFERENCES` in [./constants.js](./constants.js).
`createReducerForPreferenceKey` in [./reducer.js](./reducer.js) will create a reducer for you along with fetching, persistance and tests.

# How does it work?

### Tree shape.

- **fetching** (boolean) - are we currently fetching data?
- **values** ( Object ) - preferences

### Selectors

- **fetchingPreferences( state )** - are we currently fetching?
- **getPreference( state, key )** - get value for the specific preference key


### Actions

- **fetchPreferences()** - populate the tree
- **savePreference( key, value )** - set preference and persist all preferences in the endpoint
- **setPreference( key, value )** - set preference without persisting in API

