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
[
  { description: "Creating product: super-awesome thing", action: { ... } },
  { description: "Creating super-awesome thing variation: small", action: { ... } },
  { description: "Creating super-awesome thing variation: large", action: { ... } }
]
```

Note that the action list should not contain copies of existing edit state objects.
Instead, it is preferred to reference each object by ID.


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

The first iteration of the API code relies on action thunks to operate, but this
will likely be replaced by more declarative actions that utilize the Calypso
data layer HTTP requests.

#### Asynchronous Response

Assuming the action has a follow-up asynchronous response, it will be handled based on status:

 - Success:
   1. Edit state is updated (removing created/updated objects, turning placeholder IDs to real ones, etc.)
   2. Action List steps are updated (placeholder IDs, etc)
   3. Current step is ended
 - Failure:
   1. Error state is logged
   2. Current step is ended

#### Step End

The step is given an `endTime` field with a timestamp. This tracks timing for the
operation as well as status of the step as "complete" if successful, or "failed" if
an `error` field is present. If there are more steps after this one, the next
step is started. If this is the last step, then no further action is taken.

#### Action List Complete

The entire list is considered done either when all steps have been ended
successfully, or when an error is logged on a step.

#### Action List Clear

This action will clear the current action list from the application state.


## Questions

### What happens if one of the API requests fail?

This is one of the things the action list is designed for. It's very important
that each step updates the edit states from which it is derived. Every step,
whether it fails or succeeds must do this. If this is done properly, the list can
be discarded and a new action list can be generated upon error to pick up where
this one left off.

### What about asynchronous operations?

It's true that some steps could be carried out asynchronously. For example, it's
possible to create more than one variation at a time by sending off multiple API
requests at once. In the future, we could easily modify the `operations` field
to accept an array, which would preserve the sequential dependency order of the
steps, but allow asynchronous operations within each step. This is a good idea
for a future performance enhancement.

