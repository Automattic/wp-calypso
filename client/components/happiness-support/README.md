# Happiness Support

This component renders a card presenting our support resources, including links to the support form and documentation.

## Usage

```js
import HappinessSupport from 'calypso/components/happiness-support';

export default () => {
	return <HappinessSupport isJetpack contactButtonEventName="calypso_chat_button_clicked" />;
};
```

## Props

- _isJetpack_ (boolean) – Indicates that the Happiness Support card is related to a Jetpack Plan.
- _isJetpackFreePlan_ (boolean) – Indicates that the Happiness Support card is related to a Jetpack Free Plan.
- _contactButtonEventName_ (string) – event name that will be recorded when the contact button/link is clicked.
