# API Plan

The API Plan concept is one that is designed to help update an existing edit
state into API calls that can be handled and tracked.


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

The API plan is a declarative JavaScript array (no functions or anything else
that is not serializable). Structurally, it's a single array of "steps",
which are objects that describe each sequential step of the plan. Using the above
example, this could look like:

```
[
  { description: "Creating product: super-awesome thing", operation: { ... } },
  { description: "Creating super-awesome thing variation: small", operation: { ... } },
  { description: "Creating super-awesome thing variation: large", operation: { ... } }
]
```

Note that the plan should not contain copies of existing edit state objects.
Instead, it is preferred to reference each object by ID.


## API Plan Lifecycle

### Create

First the plan is created. This is usually by helper methods that take in a given
set of edit states and produce the plan object that is then stored in state. At
this time, the first step of the plan can also be started.

### Step Start

The next step of the plan is started, the actions fired in order to do the API
request, and then the step object is given a `startTime` field with a timestamp.
This both tracks timing and denotes the current status of the step as "running".

#### API Request

The first iteration of the API code relies on action thunks to operate, but this
will likely be replaced by more declarative actions that utilize the Calypso
data layer HTTP requests.

#### API Response

As the API response comes in, it will be handled based on status:

 - Success: Edit state is updated, plan is updated (ids, etc), and Step End is executed.
 - Failure: Error state is logged, current step is ended, and no further action is taken.

#### Step End

The step is given an `endTime` field with a timestamp. This tracks timing for the
plan as well as status of the step as "complete" if successful, or "failed" if
an `error` field is present. Upon a successful Step End, a Plan Update is
executed. If this is the last step, then no further action is taken.

#### Plan End

The entire plan is considered done either when all steps have been ended
successfully, or when an error is logged on a step.

#### Plan Clear

This action will clear the current plan from the application state.


## Questions

### What happens if one of the API requests fail?

This is one of the things the plan is designed for. It's very important that each
step of the plan updates the edit states from which it is derived. Every step,
whether it fails or succeeds must do this. If this is done properly, the plan can
be discarded and a new plan can be generated upon error to pick up where this one
left off.

### What about asynchronous operations?

It's true that some steps could be carried out asynchronously. For example, it's
possible to create more than one variation at a time by sending off multiple API
requests at once. In the future, we could easily modify the `operations` field
to accept an array, which would preserve the sequential dependency order of the
steps, but allow asynchronous operations within each step. This is a good idea
for a future performance enhancement.

