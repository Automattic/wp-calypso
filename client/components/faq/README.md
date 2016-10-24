FAQ Component
=============

FAQ component is a React component to display questions with answers in a neat way. The FAQ questions/answers are left
aligned to each other and they automatically move to the next line if there's no more available space on the current line.

## Usage

The FAQ component is made of two parts:
- FAQ parent component which has an optional `heading` prop
- FAQItem child component(s) which has a `question` and an `answer` props

```jsx
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';
import i18n from 'i18n-calypso';

export default React.createClass( {
	displayName: 'MyFAQ',

	render() {
		return (
			<FAQ>
				<FAQItem
					question="Have more questions?"
					answer="Need help deciding which plan works for you? Our happiness engineers are available for any questions you may have."
				/>
				<FAQItem
					question={ i18n.translate( 'A translated question?' ) }
					answer={ i18n.translate( 'Yeah, we got you covered!' ) }
				/>
			</FAQ>
		);
	}
} );

```

## Props

If the `heading` prop is not specified, `FAQ` parent component has a default translated string 'Frequently Asked Questions'.
Both `question` and `answer` props of the `FAQItem` child component must be specified.
