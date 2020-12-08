# Settings

Provides user configurable settings which are saved to `app.getPath( 'userData' )` (as defined by Electron).

## Functions

`isDebug()` - return whether debug mode is enabled

Defaults to config `debug.enabled_by_default`

`getSetting( setting )` - get a setting value, using default settings if not defined

`getSettingGroup( existing, group, values )` - extend the existing values with values from the named settings group

Where:

- `existing` - default values to use
- `group` - a settings group name
- `values` - optional array of values to override

`saveSetting( group, groupData )` - save `groupData` to the `group` named group

Where:

- `group` - a group name
- `groupData` - a JS object or value to save under the group. Overwrites any existing values

## Example

`settings.getSettingGroup( config.window, 'window', [ 'x', 'y', 'width', 'height' ] )`

This uses the default window settings and overrides the X, Y, with, and height values from the configured settings.
