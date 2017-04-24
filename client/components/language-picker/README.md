LanguagePicker
==============

React component used to display a Language Picker.

---

## Example Usage

```js
import LanguagePicker from 'components/language-picker';

const languages = [
	{
		value: 1,
		langSlug: 'en',
		name: 'English',
		wpLocale: 'en_US',
		popular: 1
	},
	{
		value: 11,
		langSlug: 'cs',
		name: 'Čeština',
		wpLocale: 'cs_CZ'
	}
];

class LanguagePickerDemo {
	onSelectLanguage = ( event ) => {
		this.setState( { language: event.target.value } );
	}

	render() {
		return (
			<LanguagePicker
				languages={ languages }
				valueKey="langSlug"
				value={ this.state.language }
				onChange={ this.onSelectLanguage }
			/>
		);
	}
}
```

---

## LanguagePicker

The `LanguagePicker` is a form component with API similar to a HTML `input` or `select`
element - its value is specified in a `value` prop, and it calls an `onChange` handler
when its value changes.

#### Props

`languages` - **required** Array with information about languages, their names, language
slugs, popularity etc. It's exported by `config` module under the `languages` key.

`valueKey` - **optional** Which property of the `languages` objects should be used
as the `value` of the component? The default is `value`, other options are `langSlug` and
`wpLocale`. This determines what kind of value is expeced as the `value` property and
what is the value passed as parameter in the `onChange` handler.

`value` - **optional** The selected value of the language picker

`onChange` - **optional** Handler called when the selected value is changed

------------
