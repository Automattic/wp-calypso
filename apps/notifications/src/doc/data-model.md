# Notifications Client Data Models

## Notifications

The app is currently built by directly coupling the data from the WordPress.com API for notifications with the internal data structures.
In addition to this it has a data augmentation system to handle the inherent race conditions existing with synchronizing local state with remote polling.

### Notes from the API

```
const note =
	{ id: [number]                  // note id as a number
	, type: [string]                // type of notification, such as "comment" or "like_milestone_achievement"
	, read: [1 or 0]                // boolean value representing whether or not the note has already been read
	, noticion: [unicode character] // mapping to icon in the noticon font corresponding to note category type
	, timestamp: [ISO8601 string]   // time note was created
	, title: [string]               // brief title to display above note
	, icon: [string URL]            // URL for image to show as main notification icon
	, url: [string URL]             // naturally related link to note: a post, a comment, a sign-up page, etc…
	, subject                       // list of blocks for header
	, body                          // list of blocks for body
	, meta                          // related note references: posts, sites, comments, etc…
	}
```

### Augmentation

Polling is always active in the background while the app is visible.
This means that whenever we make changes in the app we create a race condition between our local changes and updates which started to transfer across the network before we made the change.

<!-- the following diagram was generated in draw.io - it can be edited by pasting in the contents of the SVG itself -->

![network conversation exposing race when deleting a note](https://cldup.com/unQOzvDkjtq/UlbjwC.svg)

In the diagram you can see where these conditions form and the challenge we have to work around in the app to make sure that the return of a previous request doesn't cause "flickering" in the app where, for example, a note may disappear, reappear, then suddenly disappear again.
Hopefully with continued refactoring we will be able to create a "network-lock" to prevent certain updates from hitting the local data until existing requests succeed or fail, but in the meantime the app uses a system of stateful and independent data stores which govern their own type of data: likes, deletions, etc…

#### Hidden notes

When notes are marked as _spam_ or _trashed_ they should disappear from the app.
However, they should also reappear immediately if someone wants to undo the otherwise destructive action.
We maintain a "hidden notes" list of note ids which shouldn't be rendered.
When undoing a _trash_ or _spam_ action we should remove the id from this list.

```js
state.notes.hiddenNoteIds = [ id1, id2, id3 /*...*/ ];

getIsNoteHidden( store.getState(), noteId );
```

The list of hidden ids is maintained in the `state/notes/reducers.js#hiddenNoteIds` reducer.

Anything that uses the list of "visible notes" should filter out any note matching an id in this list:

- List of actually rendered notes in the list
- Determining where the "highlight" goes (keyboard navigation through the note list)
- Finding the "next note"

#### Liked notes

When comments or posts inside of notifications are _liked_ or _unliked_ then that local change should persist over external updates until the "like" network request returns.
We maintain these local likes in the Redux state.

```js
store.dispatch( actions.notes.likeNote( noteId, isLiked ) );

getIsNoteLiked( store.getState(), note );
```

This is maintained entirely within the `rest-client` and has no corresponding "undo" as with the hidden notes.
If a comment or post should be unliked after being liked then this function simply needs to be called again with the updates.
This function does not eliminate the race conditions when quickly liking and unliking in sequence.

#### Approved notes

See the description for liking and unliking above.
This works the same way except that the function is different.

```js
store.dispatch( actions.notes.approveNote( noteId, isApproved ) );

getIsNoteApproved( store.getState(), note );
```
