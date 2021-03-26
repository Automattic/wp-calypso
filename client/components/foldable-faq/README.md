# Foldable FAQ

This component is used to display accordian style/dropdown FAQ questions & answers.

---

## How to use

```js
import FoldableFAQ from 'calypso/components/foldable-faq';
import { useTranslate } from 'i18n-calypso';

export default function FoldableFAQExample() {
	const translate = useTranslate();

	return (
		<FoldableFAQ id="faq-1" question={ translate( 'Have more questions?' ) }>
			{ translate( 'No problem! Feel free to get in touch with our Happiness Engineers.' ) }
		</FoldableFAQ>
	);
}
```

## Props

| Name         | Type         | Default       | Description                                                      |
| ------------ | ------------ | ------------- | ---------------------------------------------------------------- |
| `id`\*       | `string`     | ''            | Unique id for the FAQ. Used for accessibility purposes.          |
| `className`  | `string`     | ''            | Custom class added to the root element of the component          |
| `question`\* | `React.Node` | none          | The question appearing above the answer                          |
| `children`\* | `React.Node` | none          | The answer                                                       |
| `icon`       | `string`     | chevron-right | Gridicon string                                                  |
| `iconSize`   | `number`     | 24            | Size of the icon                                                 |
| `expanded`   | `boolean`    | false         | Whether or not the the answer starts off expanded/showing answer |
| `onToggle`   | `function`   | none          | A callback function that fires every time the FAQ is toggled     |
