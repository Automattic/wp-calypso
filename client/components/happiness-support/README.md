Happiness Support
===============

This component renders a card presenting our support resources, including links to the support form and documentation. It can also render a button to open a Live chat window if the prop `showLiveChatButton` is `true`.

## Usage

```js
import React from 'react';
import HappinessSupport from 'components/happiness-support';

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

- *isJetpack* (boolean) – Indicates that the Happiness Support card is related to a Jetpack Plan.
- *isJetpackFreePlan* (boolean) – Indicates that the Happiness Support card is related to a Jetpack Free Plan.
- *liveChatButtonEventName* (string) – event name that will be recorded when the `HappychatButton` is clicked.
- *showLiveChatButton* (boolean) – Whether to show a `HappychatButton` instead of the support link `Button`
