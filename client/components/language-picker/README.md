# LanguagePicker

React component used to display a Language Picker.

---

## Example Usage

```js
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import LanguagePicker from 'calypso/components/language-picker';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { saveUserSettings } from 'calypso/state/user-settings/actions';

const languages = [
	{
		value: 1,
		langSlug: 'en',
		name: 'English',
		wpLocale: 'en_US',
		popular: 1,
	},
	{
		value: 11,
		langSlug: 'cs',
		name: 'Čeština',
		wpLocale: 'cs_CZ',
	},
];

class LanguagePickerDemo extends PureComponent {
	onSelectLanguage = ( event ) => {
		this.props.saveUserSettings( { language: event.target.value } );
	};

	render() {
		return (
			<LanguagePicker
				languages={ languages }
				valueKey="langSlug"
				value={ this.props.language }
				onChange={ this.onSelectLanguage }
			/>
		);
	}
}

export default connect( ( state ) => ( { language: getUserSetting( state, 'language' ) } ), {
	saveUserSettings,
} )( LanguagePickerDemo );
```

---

## LanguagePicker

The `LanguagePicker` is a form component with API similar to a HTML `input` or `select`
element - its value is specified in a `value` prop, and it calls an `onChange` handler
when its value changes.

### Props

`languages` - **required** Array with information about languages, their names, language
slugs, popularity etc. It's exported by `config` module under the `languages` key.

`valueKey` - **optional** Determines which property of the `languages` objects will be used
in the `value` and `onChange` props of the component. Possible values are `value` (default),
`langSlug` and `wpLocale`.

`value` - **optional** The selected value of the language picker

`onChange` - **optional** Handler called when the selected value is changed

`onClick` - **optional** Handler called when the picker is clicked on.
