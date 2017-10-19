# Activity Log Discarderer

Events in the Activity Log have a general notion of being _discarded_ or not.
Events, or activities, never truly disappear from a site.
However, in the course of restoring backups we can get into a state where
it appears as though specific events had never taken place because of
how the rewind zipped past it.
We say that these events are (temporarily) **discarded** when this happens.

Actually knowing whether or not an activity has been discarded however can be
difficult to ascertain; it depends on the perspective from which we analyze
the stream of events and it's inherently a recursive problem.

> A discarded event is an event which is hidden by a restore operation which
> itself is not also discarded from the perspective from which we are looking.

This module exists to take an existing list of activity log events and augment
that list with an accurate value for `isDiscarded` based on the combination of
rewind/restore timestamp pairs (the restore event itself and the backup event
which it is restoring) and the timestamp of our point of observation.


## Usage

The simplest way to use this is to pass in a list of activity log events to the
built in helper method, `rewriteStream`.

```js
const log = rewriteStream( getActivityLogs( … ) )
```

Of course, this _is_ just a helper around the two more fundamental bits: one
which extracts the restore events from the list and one which uses that
information to calculate the `isDiscarded` property.

```js
const events = getActivityLogs( … )
const rewinds = getRewinds( events )
const isDiscarded = isDiscardeder( rewinds, Date.now() )
const log = events.map( e => ( { ...e, activityIsDiscarded: isDiscarded( e.activityTs ) } ) )
```

If we wanted to re-examine from a mid-stream perspective we can do that too.
We just have to pass in the timestamp from the mid-stream event which we will
use as our point of observation.

```js
const log = rewriteStream( getActivityLogs( … ), selectedEvent.activityTs )
```

Obviously every event newer than the mid-stream event will be discarded because
when we examine the activity log from the perspective of the time that our
selected event occurred, none of the newer activity had yet occurred.
