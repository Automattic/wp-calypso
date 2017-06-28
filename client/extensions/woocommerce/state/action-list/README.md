# Action List

The Action List concept is one that is designed to help update an existing edit
state into a list of asynchronous actions that can be handled and tracked.


## Why do we need it?

For many of our data updates to the API, we need to handle multiple API requests
to bring our edit state to fruition on the server. This involves potentially a
series of creates, updates, and deletes.

Not only might we need to handle these in multiples (such as in bulk updates),
but some of these requests might be dependent upon others. For example, when
creating a Variable Product, one must first create the Product with an API call
before one can create the Variations for that Product, because each Variation API
call must include the Product ID (which is not present until the Product is
created.)


## What is it?

The Action List is a declarative JavaScript array (no functions or anything else
that is not serializable). Structurally, it's a single array of "steps",
which are objects that describe each sequential step in the list. Using the above
example, this could look like:

```
{
  steps: [
    { description: "Creating product: super-awesome thing", action: { ... } },
    { description: "Creating super-awesome thing variation: small", action: { ... } },
    { description: "Creating super-awesome thing variation: large", action: { ... } }
  ]
  successAction: { type: 'MY_SUCCESS_ACTION' },
  failureAction: { type: 'MY_FAILURE_ACTION' },
  clearUponComplete: true,
}
```

Note: Actions in the action list should not contain functions or anything else not serializable,
due to the fact that the action list is stored in state.


## Action List Lifecycle

### Create

First the list is created. This is usually by helper methods that take in a given
set of edit states and produce the action list object that is then stored in state.
After this, the first step of the list can be started.

### Step Start

The next step of the action list is started, the action fired to do the work of this
step, and then the step object is given a `startTime` field with a timestamp.
This both tracks timing and denotes the current status of the step as "running".

#### Action

This part is simple. When the step is started, the associated action is dispatched.

#### Asynchronous Response

For asynchronous operations, it's recommended that a data-layer handler be set to
listen for step actions and perform the asynchronous steps as necessary.

It's the responsibility of such a handler to ensure that the appropriate success
or failure action is dispatched at the conclusion of the asynchronous operation.

This should map easily to any sort of promise situation by having the `then` dispatch
success, and the `catch` dispatch failure.

Assuming the action has a follow-up asynchronous response, it will be handled based on status:

#### Edit State Updates

It is also the responsibility of the handlers to ensure that the edit state is updated
appropriately after each step. This means if an API object was created, the state
should be updated accordingly, for example.

#### Action List Updates

For many cases, there will be placeholder ids for things that have not yet been created.
It's important for each handler to update these placeholder ids with real ones as they
become available each step along the way.

#### Step End

The step is given an `endTime` field with a timestamp. This tracks timing for the
operation as well as status of the step as "complete" if successful, or "failed" if
an `error` field is present. If there are more steps after this one, the next
step is started. If this is the last step, then no further action is taken.

#### Action List Complete

The entire list is considered done either when all steps have been ended
successfully, or when an error is logged on a step. When this occurs, if the
`successAction` or `failureAction` is designated, the appropriate one will be
dispatched at the end of action list processing.

#### Action List Clear

This action will clear the current action list from the application state.
This happens automatically if `clearUponComplete` is set to true.


## Questions

### What happens if one of the API requests fail?

This is one of the things the action list is designed for. It's very important
that each step updates the edit states from which it is derived. Every step,
whether it fails or succeeds must do this. If this is done properly, the list can
be discarded and a new action list can be generated upon error to pick up where
this one left off.

### What about multiple operations at the same time?

It's true that some steps could be carried out at the same time. For example, it's
possible to create more than one variation at a time by sending off multiple API
requests at once. In the future, we could easily modify the `operations` field
to accept an array, which would preserve the sequential dependency order of the
steps, but allow asynchronous operations within each step. This is a good idea
for a future performance enhancement.

