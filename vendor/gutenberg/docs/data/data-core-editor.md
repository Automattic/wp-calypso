# **core/editor**: The Editor's Data

## Selectors 

### hasEditorUndo

Returns true if any past editor history snapshots exist, or false otherwise.

*Parameters*

 * state: Global application state.

### hasEditorRedo

Returns true if any future editor history snapshots exist, or false
otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether redo history exists.

### isEditedPostNew

Returns true if the currently edited post is yet to be saved, or false if
the post has been saved.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post is new.

### isEditedPostDirty

Returns true if there are unsaved values for the current edit session, or
false if the editing state matches the saved or new post.

*Parameters*

 * state: Global application state.

*Returns*

Whether unsaved values exist.

### isCleanNewPost

Returns true if there are no unsaved values for the current edit session and if
the currently edited post is new (and has never been saved before).

*Parameters*

 * state: Global application state.

*Returns*

Whether new post and unsaved values exist.

### getCurrentPost

Returns the post currently being edited in its last known saved state, not
including unsaved edits. Returns an object containing relevant default post
values if the post has not yet been saved.

*Parameters*

 * state: Global application state.

*Returns*

Post object.

### getCurrentPostType

Returns the post type of the post currently being edited.

*Parameters*

 * state: Global application state.

*Returns*

Post type.

### getCurrentPostId

Returns the ID of the post currently being edited, or null if the post has
not yet been saved.

*Parameters*

 * state: Global application state.

*Returns*

ID of current post.

### getCurrentPostRevisionsCount

Returns the number of revisions of the post currently being edited.

*Parameters*

 * state: Global application state.

*Returns*

Number of revisions.

### getCurrentPostLastRevisionId

Returns the last revision ID of the post currently being edited,
or null if the post has no revisions.

*Parameters*

 * state: Global application state.

*Returns*

ID of the last revision.

### getPostEdits

Returns any post values which have been changed in the editor but not yet
been saved.

*Parameters*

 * state: Global application state.

*Returns*

Object of key value pairs comprising unsaved edits.

### getCurrentPostAttribute

Returns an attribute value of the saved post.

*Parameters*

 * state: Global application state.
 * attributeName: Post attribute name.

*Returns*

Post attribute value.

### getEditedPostAttribute

Returns a single attribute of the post being edited, preferring the unsaved
edit if one exists, but falling back to the attribute for the last known
saved state of the post.

*Parameters*

 * state: Global application state.
 * attributeName: Post attribute name.

*Returns*

Post attribute value.

### getAutosaveAttribute

Returns an attribute value of the current autosave revision for a post, or
null if there is no autosave for the post.

*Parameters*

 * state: Global application state.
 * attributeName: Autosave attribute name.

*Returns*

Autosave attribute value.

### getEditedPostVisibility

Returns the current visibility of the post being edited, preferring the
unsaved value if different than the saved post. The return value is one of
"private", "password", or "public".

*Parameters*

 * state: Global application state.

*Returns*

Post visibility.

### isCurrentPostPending

Returns true if post is pending review.

*Parameters*

 * state: Global application state.

*Returns*

Whether current post is pending review.

### isCurrentPostPublished

Return true if the current post has already been published.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post has been published.

### isCurrentPostScheduled

Returns true if post is already scheduled.

*Parameters*

 * state: Global application state.

*Returns*

Whether current post is scheduled to be posted.

### isEditedPostPublishable

Return true if the post being edited can be published.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post can been published.

### isEditedPostSaveable

Returns true if the post can be saved, or false otherwise. A post must
contain a title, an excerpt, or non-empty content to be valid for save.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post can be saved.

### isEditedPostEmpty

Returns true if the edited post has content. A post has content if it has at
least one block or otherwise has a non-empty content property assigned.

*Parameters*

 * state: Global application state.

*Returns*

Whether post has content.

### isEditedPostAutosaveable

Returns true if the post can be autosaved, or false otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post can be autosaved.

### getAutosave

Returns the current autosave, or null if one is not set (i.e. if the post
has yet to be autosaved, or has been saved or published since the last
autosave).

*Parameters*

 * state: Editor state.

*Returns*

Current autosave, if exists.

### hasAutosave

Returns the true if there is an existing autosave, otherwise false.

*Parameters*

 * state: Global application state.

*Returns*

Whether there is an existing autosave.

### isEditedPostBeingScheduled

Return true if the post being edited is being scheduled. Preferring the
unsaved status values.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post has been published.

### getDocumentTitle

Gets the document title to be used.

*Parameters*

 * state: Global application state.

*Returns*

Document title.

### getBlockName

Returns a block's name given its UID, or null if no block exists with the
UID.

*Parameters*

 * state: Editor state.
 * uid: Block unique ID.

*Returns*

Block name.

### getBlockCount

Returns the number of blocks currently present in the post.

*Parameters*

 * state: Global application state.
 * rootUID: Optional root UID of block list.

*Returns*

Number of blocks in the post.

### getBlockSelectionStart

Returns the current block selection start. This value may be null, and it
may represent either a singular block selection or multi-selection start.
A selection is singular if its start and end match.

*Parameters*

 * state: Global application state.

*Returns*

UID of block selection start.

### getBlockSelectionEnd

Returns the current block selection end. This value may be null, and it
may represent either a singular block selection or multi-selection end.
A selection is singular if its start and end match.

*Parameters*

 * state: Global application state.

*Returns*

UID of block selection end.

### getSelectedBlockCount

Returns the number of blocks currently selected in the post.

*Parameters*

 * state: Global application state.

*Returns*

Number of blocks selected in the post.

### hasSelectedBlock

Returns true if there is a single selected block, or false otherwise.

*Parameters*

 * state: Editor state.

*Returns*

Whether a single block is selected.

### getSelectedBlockUID

Returns the currently selected block UID, or null if there is no selected
block.

*Parameters*

 * state: Global application state.

*Returns*

Selected block UID.

### getSelectedBlock

Returns the currently selected block, or null if there is no selected block.

*Parameters*

 * state: Global application state.

*Returns*

Selected block.

### getBlockRootUID

Given a block UID, returns the root block from which the block is nested, an
empty string for top-level blocks, or null if the block does not exist.

*Parameters*

 * state: Global application state.
 * uid: Block from which to find root UID.

*Returns*

Root UID, if exists

### getAdjacentBlockUid

Returns the UID of the block adjacent one at the given reference startUID and modifier
directionality. Defaults start UID to the selected block, and direction as
next block. Returns null if there is no adjacent block.

*Parameters*

 * state: Global application state.
 * startUID: Optional UID of block from which to search.
 * modifier: Directionality multiplier (1 next, -1 previous).

*Returns*

Return the UID of the block, or null if none exists.

### getPreviousBlockUid

Returns the previous block's UID from the given reference startUID. Defaults start
UID to the selected block. Returns null if there is no previous block.

*Parameters*

 * state: Global application state.
 * startUID: Optional UID of block from which to search.

*Returns*

Adjacent block's UID, or null if none exists.

### getNextBlockUid

Returns the next block's UID from the given reference startUID. Defaults start UID
to the selected block. Returns null if there is no next block.

*Parameters*

 * state: Global application state.
 * startUID: Optional UID of block from which to search.

*Returns*

Adjacent block's UID, or null if none exists.

### getSelectedBlocksInitialCaretPosition

Returns the initial caret position for the selected block.
This position is to used to position the caret properly when the selected block changes.

*Parameters*

 * state: Global application state.

*Returns*

Selected block.

### getFirstMultiSelectedBlockUid

Returns the unique ID of the first block in the multi-selection set, or null
if there is no multi-selection.

*Parameters*

 * state: Global application state.

*Returns*

First unique block ID in the multi-selection set.

### getLastMultiSelectedBlockUid

Returns the unique ID of the last block in the multi-selection set, or null
if there is no multi-selection.

*Parameters*

 * state: Global application state.

*Returns*

Last unique block ID in the multi-selection set.

### isFirstMultiSelectedBlock

Returns true if a multi-selection exists, and the block corresponding to the
specified unique ID is the first block of the multi-selection set, or false
otherwise.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.

*Returns*

Whether block is first in mult-selection.

### isBlockMultiSelected

Returns true if the unique ID occurs within the block multi-selection, or
false otherwise.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.

*Returns*

Whether block is in multi-selection set.

### getMultiSelectedBlocksStartUid

Returns the unique ID of the block which begins the multi-selection set, or
null if there is no multi-selection.

N.b.: This is not necessarily the first uid in the selection. See
getFirstMultiSelectedBlockUid().

*Parameters*

 * state: Global application state.

*Returns*

Unique ID of block beginning multi-selection.

### getMultiSelectedBlocksEndUid

Returns the unique ID of the block which ends the multi-selection set, or
null if there is no multi-selection.

N.b.: This is not necessarily the last uid in the selection. See
getLastMultiSelectedBlockUid().

*Parameters*

 * state: Global application state.

*Returns*

Unique ID of block ending multi-selection.

### getBlockOrder

Returns an array containing all block unique IDs of the post being edited,
in the order they appear in the post. Optionally accepts a root UID of the
block list for which the order should be returned, defaulting to the top-
level block order.

*Parameters*

 * state: Global application state.
 * rootUID: Optional root UID of block list.

*Returns*

Ordered unique IDs of post blocks.

### getBlockIndex

Returns the index at which the block corresponding to the specified unique ID
occurs within the post block order, or `-1` if the block does not exist.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.
 * rootUID: Optional root UID of block list.

*Returns*

Index at which block exists in order.

### isBlockSelected

Returns true if the block corresponding to the specified unique ID is
currently selected and no multi-selection exists, or false otherwise.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.

*Returns*

Whether block is selected and multi-selection exists.

### hasSelectedInnerBlock

Returns true if one of the block's inner blocks is selected.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.

*Returns*

Whether the block as an inner block selected

### isBlockWithinSelection

Returns true if the block corresponding to the specified unique ID is
currently selected but isn't the last of the selected blocks. Here "last"
refers to the block sequence in the document, _not_ the sequence of
multi-selection, which is why `state.blockSelection.end` isn't used.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.

*Returns*

Whether block is selected and not the last in
                   the selection.

### hasMultiSelection

Returns true if a multi-selection has been made, or false otherwise.

*Parameters*

 * state: Editor state.

*Returns*

Whether multi-selection has been made.

### isMultiSelecting

Whether in the process of multi-selecting or not. This flag is only true
while the multi-selection is being selected (by mouse move), and is false
once the multi-selection has been settled.

*Parameters*

 * state: Global application state.

*Returns*

True if multi-selecting, false if not.

### isSelectionEnabled

Whether is selection disable or not.

*Parameters*

 * state: Global application state.

*Returns*

True if multi is disable, false if not.

### getBlockMode

Returns thee block's editing mode.

*Parameters*

 * state: Global application state.
 * uid: Block unique ID.

*Returns*

Block editing mode.

### isTyping

Returns true if the user is typing, or false otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether user is typing.

### getBlockInsertionPoint

Returns the insertion point, the index at which the new inserted block would
be placed. Defaults to the last index.

*Parameters*

 * state: Global application state.

*Returns*

Insertion point object with `rootUID`, `layout`, `index`

### isBlockInsertionPointVisible

Returns true if we should show the block insertion point.

*Parameters*

 * state: Global application state.

*Returns*

Whether the insertion point is visible or not.

### isValidTemplate

Returns whether the blocks matches the template or not.

*Parameters*

 * state: null

*Returns*

Whether the template is valid or not.

### getTemplate

Returns the defined block template

*Parameters*

 * state: null

*Returns*

Block Template

### getTemplateLock

Returns the defined block template lock
in the context of a given root block or in the global context.

*Parameters*

 * state: null
 * rootUID: Block UID.

*Returns*

Block Template Lock

### isSavingPost

Returns true if the post is currently being saved, or false otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether post is being saved.

### didPostSaveRequestSucceed

Returns true if a previous post save was attempted successfully, or false
otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post was saved successfully.

### didPostSaveRequestFail

Returns true if a previous post save was attempted but failed, or false
otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post save failed.

### isAutosavingPost

Returns true if the post is autosaving, or false otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether the post is autosaving.

### getSuggestedPostFormat

Returns a suggested post format for the current post, inferred only if there
is a single block within the post and it is of a type known to match a
default post format. Returns null if the format cannot be determined.

*Parameters*

 * state: Global application state.

*Returns*

Suggested post format.

### getNotices

Returns the user notices array.

*Parameters*

 * state: Global application state.

*Returns*

List of notices.

### isSavingSharedBlock

Returns whether or not the shared block with the given ID is being saved.

*Parameters*

 * state: Global application state.
 * ref: The shared block's ID.

*Returns*

Whether or not the shared block is being saved.

### isFetchingSharedBlock

Returns true if the shared block with the given ID is being fetched, or
false otherwise.

*Parameters*

 * state: Global application state.
 * ref: The shared block's ID.

*Returns*

Whether the shared block is being fetched.

### getSharedBlocks

Returns an array of all shared blocks.

*Parameters*

 * state: Global application state.

*Returns*

An array of all shared blocks.

### getStateBeforeOptimisticTransaction

Returns state object prior to a specified optimist transaction ID, or `null`
if the transaction corresponding to the given ID cannot be found.

*Parameters*

 * state: Current global application state.
 * transactionId: Optimist transaction ID.

*Returns*

Global application state prior to transaction.

### isPublishingPost

Returns true if the post is being published, or false otherwise.

*Parameters*

 * state: Global application state.

*Returns*

Whether post is being published.

### getProvisionalBlockUID

Returns the provisional block UID, or null if there is no provisional block.

*Parameters*

 * state: Editor state.

*Returns*

Provisional block UID, if set.

### isPermalinkEditable

Returns whether the permalink is editable or not.

*Parameters*

 * state: Editor state.

*Returns*

Whether or not the permalink is editable.

### getPermalink

Returns the permalink for the post.

*Parameters*

 * state: Editor state.

*Returns*

The permalink.

### getPermalinkParts

Returns the permalink for a post, split into it's three parts: the prefix, the postName, and the suffix.

*Parameters*

 * state: Editor state.

*Returns*

The prefix, postName, and suffix for the permalink.

### inSomeHistory

Returns true if an optimistic transaction is pending commit, for which the
before state satisfies the given predicate function.

*Parameters*

 * state: Editor state.
 * predicate: Function given state, returning true if match.

*Returns*

Whether predicate matches for some history.

### getBlockListSettings

Returns the Block List settings of a block if any.

*Parameters*

 * state: Editor state.
 * uid: Block UID.

*Returns*

Block settings of the block if set.

### getEditorSettings

Returns the editor settings.

*Parameters*

 * state: Editor state.

*Returns*

The editor settings object

### getTokenSettings

Returns the editor settings.

*Parameters*

 * state: Editor state.

*Returns*

The editor settings object

## Actions

### setupEditor

Returns an action object used in signalling that editor has initialized with
the specified post object and editor settings.

*Parameters*

 * post: Post object.
 * autosaveStatus: The Post's autosave status.

### resetPost

Returns an action object used in signalling that the latest version of the
post has been received, either by initialization or save.

*Parameters*

 * post: Post object.

### resetAutosave

Returns an action object used in signalling that the latest autosave of the
post has been received, by initialization or autosave.

*Parameters*

 * post: Autosave post object.

### updatePost

Returns an action object used in signalling that a patch of updates for the
latest version of the post have been received.

*Parameters*

 * edits: Updated post fields.

### setupEditorState

Returns an action object used to setup the editor state when first opening an editor.

*Parameters*

 * post: Post object.
 * blocks: Array of blocks.
 * edits: Initial edited attributes object.

### resetBlocks

Returns an action object used in signalling that blocks state should be
reset to the specified array of blocks, taking precedence over any other
content reflected as an edit in state.

*Parameters*

 * blocks: Array of blocks.

### receiveBlocks

Returns an action object used in signalling that blocks have been received.
Unlike resetBlocks, these should be appended to the existing known set, not
replacing.

*Parameters*

 * blocks: Array of block objects.

### updateBlockAttributes

Returns an action object used in signalling that the block attributes with
the specified UID has been updated.

*Parameters*

 * uid: Block UID.
 * attributes: Block attributes to be merged.

### updateBlock

Returns an action object used in signalling that the block with the
specified UID has been updated.

*Parameters*

 * uid: Block UID.
 * updates: Block attributes to be merged.

### toggleSelection

Returns an action object that enables or disables block selection.

*Parameters*

 * boolean: [isSelectionEnabled=true] Whether block selection should
                                           be enabled.

### replaceBlocks

Returns an action object signalling that a blocks should be replaced with
one or more replacement blocks.

*Parameters*

 * uids: Block UID(s) to replace.
 * blocks: Replacement block(s).

### replaceBlock

Returns an action object signalling that a single block should be replaced
with one or more replacement blocks.

*Parameters*

 * uid: Block UID(s) to replace.
 * block: Replacement block(s).

### moveBlockToPosition

Returns an action object signalling that an indexed block should be moved
to a new index.

*Parameters*

 * uid: The UID of the block.
 * fromRootUID: root UID source.
 * toRootUID: root UID destination.
 * layout: layout to move the block into.
 * index: The index to move the block into.

### insertBlock

Returns an action object used in signalling that a single block should be
inserted, optionally at a specific index respective a root block list.

*Parameters*

 * block: Block object to insert.
 * index: Index at which block should be inserted.
 * rootUID: Optional root UID of block list to insert.

### insertBlocks

Returns an action object used in signalling that an array of blocks should
be inserted, optionally at a specific index respective a root block list.

*Parameters*

 * blocks: Block objects to insert.
 * index: Index at which block should be inserted.
 * rootUID: Optional root UID of block list to insert.

### showInsertionPoint

Returns an action object used in signalling that the insertion point should
be shown.

### hideInsertionPoint

Returns an action object hiding the insertion point.

### setTemplateValidity

Returns an action object resetting the template validity.

*Parameters*

 * isValid: template validity flag.

### checkTemplateValidity

Returns an action object to check the template validity.

### synchronizeTemplate

Returns an action object synchronize the template with the list of blocks

### savePost

Returns an action object to save the post.

*Parameters*

 * options: Options for the save.
 * options.autosave: Perform an autosave if true.

### mergeBlocks

Returns an action object used in signalling that two blocks should be merged

*Parameters*

 * blockAUid: UID of the first block to merge.
 * blockBUid: UID of the second block to merge.

### autosave

Returns an action object used in signalling that the post should autosave.

### redo

Returns an action object used in signalling that undo history should
restore last popped state.

### undo

Returns an action object used in signalling that undo history should pop.

### createUndoLevel

Returns an action object used in signalling that undo history record should
be created.

### removeBlocks

Returns an action object used in signalling that the blocks
corresponding to the specified UID set are to be removed.

*Parameters*

 * uids: Block UIDs.
 * selectPrevious: True if the previous block should be selected when a block is removed.

### removeBlock

Returns an action object used in signalling that the block with the
specified UID is to be removed.

*Parameters*

 * uid: Block UID.
 * selectPrevious: True if the previous block should be selected when a block is removed.

### toggleBlockMode

Returns an action object used to toggle the block editing mode (visual/html).

*Parameters*

 * uid: Block UID.

### startTyping

Returns an action object used in signalling that the user has begun to type.

### stopTyping

Returns an action object used in signalling that the user has stopped typing.

### createNotice

Returns an action object used to create a notice.

*Parameters*

 * status: The notice status.
 * content: The notice content.
 * options: The notice options.  Available options:
                             `id` (string; default auto-generated)
                             `isDismissible` (boolean; default `true`).

### removeNotice

Returns an action object used to remove a notice.

*Parameters*

 * id: The notice id.

### fetchSharedBlocks

Returns an action object used to fetch a single shared block or all shared
blocks from the REST API into the store.

*Parameters*

 * id: If given, only a single shared block with this ID will
                    be fetched.

### receiveSharedBlocks

Returns an action object used in signalling that shared blocks have been
received. `results` is an array of objects containing:
 - `sharedBlock` - Details about how the shared block is persisted.
 - `parsedBlock` - The original block.

*Parameters*

 * results: Shared blocks received.

### saveSharedBlock

Returns an action object used to save a shared block that's in the store to
the REST API.

*Parameters*

 * id: The ID of the shared block to save.

### deleteSharedBlock

Returns an action object used to delete a shared block via the REST API.

*Parameters*

 * id: The ID of the shared block to delete.

### updateSharedBlockTitle

Returns an action object used in signalling that a shared block's title is
to be updated.

*Parameters*

 * id: The ID of the shared block to update.
 * title: The new title.

### convertBlockToStatic

Returns an action object used to convert a shared block into a static block.

*Parameters*

 * uid: The ID of the block to attach.

### convertBlockToShared

Returns an action object used to convert a static block into a shared block.

*Parameters*

 * uid: The ID of the block to detach.

### insertDefaultBlock

Returns an action object used in signalling that a new block of the default
type should be added to the block list.

*Parameters*

 * attributes: Optional attributes of the block to assign.
 * rootUID: Optional root UID of block list to append.
 * index: Optional index where to insert the default block

### updateBlockListSettings

Returns an action object that changes the nested settings of a given block.

*Parameters*

 * id: UID of the block whose nested setting.
 * settings: Object with the new settings for the nested block.

### updateEditorSettings

Returns an action object used in signalling that the editor settings have been updated.

*Parameters*

 * settings: Updated settings
