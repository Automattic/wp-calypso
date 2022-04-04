# OlarkChat

Integrate olark chat widget.

## How to use

First, grab yor Olark embed code from your Olark account. As of writing this, it's in the following line of the embed code:

```js
olark.identify( 'YOUR_SITE_ID' );
```

Next, add this ID to the config file's `olark_chat_identity` prop.

Here's an example of how to use this component:

```js
import config from '@automattic/calypso-config';
import OlarkChat from 'calypso/components/olark-chat';

function olarkChatWidget() {
	const olarkIdentity = config( 'olark_chat_identity' );
	const olarkSystemsGroupId = 'YOUR_SYSTEM_ID';

	return (
		<OlarkChat
			identity={ olarkIdentity }
			shouldDisablePreChatSurvey
			systemsGroupId={ olarkSystemsGroupId }
		/>
	);
}
```

## Props

### `identity`

- **Type:** `String`
- **Required:** `yes`

Your olark site ID retrieved from the embed code.

### `systemsGroupId`

- **Type:** `String`
- **Required:** `no`
- **Default:** `null`

Use this if you have user groups defined in the olark dashboard, and would like chats on the current page to be routed to a specific user group.

### `shouldDisablePreChatSurvey`

- **Type:** `Boolean`
- **Required:** `no`
- **Default:** `false`

If pre-chat survey is enabled on the olark dashboard, the default behaviour is to show the survey in all pages. Set this flag to `true` to disable it on the current page.
