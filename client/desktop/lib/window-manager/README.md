# Window Manager

Keeps track of any child windows opened by the app. Only one instance of a child window of a given type can be open, and
subsequent calls will result in that child window being brought to the front.

All window settings are stored in the config files.

## Functions

`openPreferences()` - open preferences window using `config.preferencesWindow`

`openAbout()` - open about window using `config.aboutWindow`

`openSecret()` - open secret window using `config.secretWindow`

`openWapuu()` - open Wappu window using `config.wapuu`
