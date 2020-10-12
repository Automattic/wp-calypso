# User Settings

This store holds user settings from `/me/settings`.

## Usage

1. Render `QueryUserSettings` from `components/data/query-user-settings`
2. Connect your component specifying proper setting names:
   ```js
   export default connect(
   	( state ) => ( {
   		language: getUserSetting( state, 'language' ),
   	} ),
   	( dispatch ) => ( {
   		saveLanguage: ( language ) => dispatch( saveUserSettings( { language } ) ),
   	} )
   )( Account );
   ```
