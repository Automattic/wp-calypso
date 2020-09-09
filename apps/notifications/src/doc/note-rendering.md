# Notification Detail Rendering

When a user clicks a note to view, that notification is rendered to the user in a slide-out drawer. The pipeline for rendering this drawer to the user begins in `/src/panel/templates/index.jsx`. When the user has selected a note to view, this component renders a child `Note` component from `src/panel/templates/note.jsx` with the property `detailView` set to `true`.

This `detailView` prop further causes the `Note` component to render (among other things) a `NoteBody` component (`/src/panel/templates/body.jsx`). The `render` method for this component is where the majority of rendering logic for a notification takes place.

## Rendering Pipeline

The notification object returned from the server contains, among other things, a `body` array of one or more `block` objects which contain a type, the text of the notification, and an array of `ranges`:

```js
"ranges": [
	{
		"url": "https://www.example.com/",
		"indices": [
			397,
			416
		]
	},
	{
		"type": "match",
		"indices": [
			598,
			616
		]
	},
	{
		"type": "match",
		"indices": [
			682,
			700
		]
	}
]
```

The indices of these ranges indicate locations in the body's text string where special formatting is needed.

After some initial processing, the `NoteBody` component performs a switch statement on each block object based on its type:

```js
switch ( block.signature.type ) {
	case 'user':
		body.push(
			<User
				key={ blockKey }
				block={ block.block }
				noteType={ this.props.note.type }
				note={ this.props.note }
				timestamp={ this.props.note.timestamp }
				url={ this.props.note.url }
			/>
		);
		break;
	case 'comment':
		body.push( <Comment key={ blockKey } block={ block.block } meta={ this.props.note.meta } /> );
		break;
	case 'post':
		body.push( <Post key={ blockKey } block={ block.block } meta={ this.props.note.meta } /> );
		break;
	case 'reply':
		replyBlock = <ReplyBlock key={ blockKey } block={ block.block } />;
		break;
	default:
		body.push( p( html( block.block ) ) );
		break;
}
```

Depending on the item's type, a different block component is rendered - `User` for a representation of a user (for instance, in a notification of a user liking a particular post), `Comment` for a comment made on a blog post, `Post` for a blog post (i.e. on a blog the user is following), `ReplyBlock` for a reply to a comment(?).

_n.b. - these 'blocks' are separate from the concept of 'blocks' in the Gutenberg block editor; a notification might have multiple blocks (for instance, multiple `User` blocks for multiple likes on a post), or it might have a single `Post` block, which then further renders Gutenberg blocks as part of the post content._

These notification block components will be your entry point for any modifications you need to do to the way a particular notification is rendered to the user.

For instance, if the user has received a notification about a post on a blog they are following, the component in question will be `src/panel/notifications/block-post.jsx`:

```js
import React from 'react';

import { html } from '../indices-to-html';
import { p } from './functions';

const PostBlock = ( { block } ) => <div className="wpnc__post">{ p( html( block ) ) }</div>;

export default PostBlock;
```

First, the block is passed to the `html()` function from `/src/panel/indices-to-html/index.js`, which processes the block's content information (making use of the `ranges` mentioned earlier) to split that information into chunks based on how they should be rendered. These chunks are then processed to reintroduce HTML tags back into the plain text content at the points indicated by the values in the `ranges` property.

The result of this function (a string enhanced with HTML tag information) is then passed to `p()` in `src/panel/templates/functions.jsx`, which adds further HTML tag formatting based on line breaks and other special characters (such as backticks for code blocks).

## Troubleshooting and Updating Renderings

Local development of notifications can take place making use of the Calypso dev server, as any changes made to `src/apps/notifications` will be reflected in the Calypso local development environment automatically.

However, as notifications can also be viewed in an iframe on non-Calypso sites using the masterbar (see https://github.com/Automattic/wp-calypso/edit/master/apps/notifications/README.md), any changes to the notifications sub-application should also be tested on a sandboxed WP.com site. To do this, run the following commands:

```bash
# Builds files and places them in `apps/notifications/dist`
cd apps/notifications
yarn build
```

Then copy the built `dist` folder to your sandbox environment to test updated rendering behavior.
