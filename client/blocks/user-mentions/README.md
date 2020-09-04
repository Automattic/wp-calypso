User Mentions
=============

This block provides a higher-order component `withUserMentions()`, which can be used in conjunction with a standard textarea to add user mentions support. Typing '@*something*' in the textarea will produce a popover menu to select a username by clicking or pressing Enter or Tab.

It also provides the components `UserMentionsSuggestionList` and `UserMentionsSuggestion`, which are also used in the
[Editor Mentions TinyMCE plugin](https://github.com/Automattic/wp-calypso/tree/HEAD/client/components/tinymce/plugins/mentions).

#### How to use

```js
import withUserMentions from 'blocks/user-mentions';

const ExampleInput = React.forwardRef( ( props, ref ) => (
	<textarea
		className="form-textarea"
		ref={ ref }
		onKeyUp={ props.onKeyUp }
		onKeyDown={ props.onKeyDown } />
) );

export default withUserMentions( ExampleInput );

```

Note: you'll need to wrap the child component with `React.forwardRef`, and pass along the `onKeyUp` and `onKeyDown` props.

#### Higher order components

`addUserMentions` (add.jsx) provides the suggestion popup to the wrapped component. If you don't want suggestions from the API, you can just hand this component a `suggestions` prop. The Devdocs example uses this HOC.

`connectUserMentions` (connect.jsx) provides a list of user suggestions from the API to the wrapped component.

`withUserMentions` (index.jsx) combines the two higher-order components above. This HOC is used by the Reader comments box.
