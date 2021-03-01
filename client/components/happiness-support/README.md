# Happiness Support

This component renders a card presenting our support resources, including links to the support form and documentation. It can also render a button to open a Live chat window if the prop `showLiveChatButton` is `true`.

## Usage

```js
import React from 'react';
import HappinessSupport from 'calypso/components/happiness-support';

export default () => {
	return (
		<HappinessSupport
			isJetpack
			liveChatButtonEventName="calypso_chat_button_clicked"
			showLiveChatButton
		/>
	);
};
```

## Props

- _isJetpack_ (boolean) – Indicates that the Happiness Support card is related to a Jetpack Plan.
- _isJetpackFreePlan_ (boolean) – Indicates that the Happiness Support card is related to a Jetpack Free Plan.
- _liveChatButtonEventName_ (string) – event name that will be recorded when the `HappychatButton` is clicked.
- _showLiveChatButton_ (boolean) – Whether to show a `HappychatButton` instead of the support link `Button`
