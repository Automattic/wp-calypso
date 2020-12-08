# User Mentions

This block provides a higher-order component `withUserMentions()`, which can be used in conjunction with a standard textarea to add user mentions support. Typing '@_something_' in the textarea will produce a popover menu to select a username by clicking or pressing Enter or Tab.

It also provides the components `UserMentionsSuggestionList` and `UserMentionsSuggestion`.

## How to use

```js
import FormTextarea from 'calypso/components/forms/form-textarea';
import withUserMentions from 'calypso/blocks/user-mentions';

const ExampleInput = React.forwardRef( ( props, ref ) => (
	<FormTextarea forwardedRef={ ref } onKeyUp={ props.onKeyUp } onKeyDown={ props.onKeyDown } />
) );

export default withUserMentions( ExampleInput );
```

Note: you'll need to wrap the child component with `React.forwardRef`, and pass along the `onKeyUp` and `onKeyDown` props.

## Higher order components

`addUserMentions` (add.jsx) provides the suggestion popup to the wrapped component. If you don't want suggestions from the API, you can just hand this component a `suggestions` prop. The Devdocs example uses this HOC.

`connectUserMentions` (connect.jsx) provides a list of user suggestions from the API to the wrapped component.

`withUserMentions` (index.jsx) combines the two higher-order components above. This HOC is used by the Reader comments box.
