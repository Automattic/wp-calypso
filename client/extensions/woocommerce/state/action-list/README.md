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

The action list is a structure that defines the steps needed to be executed.
It is passed from one action to the next until it is all complete.
The form of the action list is updated to denote current state as it is passed on.
Note: Action list objects are copied from action to action and never mutated.

### Lifecycle

The action list starts out with a list of steps:

```
{
  nextSteps: [ step1, step2, step3, step4, step5 ],
}
```

As the first step starts, it is designated as the `currentStep`

```
{
  currentStep: step1,
  nextSteps: [ step2, step3, step4, step5 ],
}
```

Then after it completes, it moves to the `prevSteps` array.
Note that from this state, it becomes possible to continue the action list
even after a step fails, although that will not automatically happen.

```
{
  prevSteps: [ step1 ],
  currentStep: null,
  nextSteps: [ step2, step3, step4, step5 ],
}
```

Then step2 is started.

```
{
  prevSteps: [ step1 ],
  currentStep: step2,
  nextSteps: [ step3, step4, step5 ],
}
```

And so on...

```
{
  prevSteps: [ step1, step2 ],
  currentStep: null,
  nextSteps: [ step3, step4, step5 ],
}
```

Until all steps are complete.

```
{
  prevSteps: [ step1, step2, step3, step4, step5 ],
  currentStep: null,
  nextSteps: [],
}
```

### Step objects

Each step object consists initially of a description and an `onStep` event.

```
{ description: translate( 'Reticulating Splines' ), onStep: reticulateSplines }
```

Note that the description is designed for user display, so it should be translated.

The `onStep` function has two parameters that are passed to it:

```
function onStep( dispatch, actionList ) {}
```

The `dispatch` function from the store. Can be used to send off actions to the system.

The `actionList` parameter is the current state of the action list.

Each `onStep` function can also return an action, that will be dispatched as well.

Note that it's the responsibility of `onStep` to eventually dispatch either
`actionListStepSuccess` or `actionListStepFailure`.

If `actionListStepSuccess` is dispatched, the current step will be marked as
complete, and the next step will be started automatically.

If `actionListStepFailure` is dispatched, the current step will be marked as
complete, but the next step will not be started automatically. If after resolving
the error, the list is still valid, `actionListStepNext` can be called manually
to continue the steps. (e.g. If an optional step fails, the user is
presented with an option to "continue" or "abort". "continue" would dispatch
`actionListStepNext` and "abort" would dispatch `actionListStepClear`.)

After each step is started a `startTime` is assigned to it, and after the
step is completed via a success or failure, an `endTime` is assigned. These
timestamps are the local time in the browser, and can be used for informational
purposes, or to determine acceptable timeouts for a step.
The `getActionList` selector can be used to retrieve this data about the current
action-list to show information to the user.

### List Completion events

There are two completion events that can be used to send actions at the end
of the action list. One for success, and one for failure.

```
{
  prevSteps: [ step1 ],
  currentStep: step2,
  nextSteps: [ step3, step4, step5 ],

  onSuccess: notifySuccess,
  onFailure: notifyFailure,
}
```

Each event uses the same function signature as the step event functions:

```
function onSuccess( dispatch, actionList ) {}
function onFailure( dispatch, actionList ) {}
```

Note that it's likely that you will want to dispatch `actionListClear()` from each
of these functions. That is, unless you want the user to be able to review the
action list results afterwards. Then you can just clear it when they're done.

### Example

#### Simple Example

As a simple example to fit all of this together, we'll use a simple post/comments fetch.
We'll start by creating the new action-list. Note the abbreviated `onStep` functions that
just return actions.

```
const actionList = {
  nextSteps: [
    { description: translate( 'Fetching post' ), onStep = () => fetchPost( siteId, postId ) }
    { description: translate( 'Fetching comments' ), onStep = () => fetchComments( siteId, postId ) }
  ],
  onSuccess: ( dispatch ) => {
    dispatch( successNotice( translate( 'Post fetched' ), { duration: 4000 } ) ),
    dispatch( actionListClear() );
  },
  onFailure: ( dispatch ) => {
    dispatch( errorNotice( translate( 'Oops, something went wrong.' ) ) );
    dispatch( actionListClear() );
  },
};
```

From there, all that is needed is to start the list. This is done by dispatching
the `actionlistStepNext` action which starts the "next" (read: first) step of the list.

```
dispatch( actionListStepNext( actionList ) );
```

#### More Complex Example

**TBD**

Until then, take a look at the `makeProductActionList` function in `client/extensions/woocommerce/state/data-layer/ui/products`.
