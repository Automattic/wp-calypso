# Getting notification data

This app has a complicated system for fetching and synchronizing its data with the notifications data on WordPress.com servers.
An API fetcher, network optimizer, and Pinghub connection form this system in order to achieve the goals of having real-time-like updates while minimizing network usage.
There is a major distinction between data _fetching_, which inclues the retrieval of external updates, and data _updating_, which signals changes to some remote server or servers.
Optimization happens on the data fetching side while the data updating nominally involves direct API calls.

## API fetching

WordPress.com provides the `/me/notifications` API endpoint which will return notification data for the authenticated user making the call.
That response will return the generated notification data for all available records.
Additionally it includes the `note_hash` which will be used for optimizing updates and network calls.
Currently the responses from these calls is passed directly into the app state.

## Network optimization

When requesting only a list of notification ids and the associated `note_hash`, the WordPress.com API will return a response _faster_ than when requesting the fully-generated notifications _and_ in a much smaller response.
We maintain two separate streams of data when fetching in the app: one stream maintains a list of notification ids and their associated `note_hash` while the other fetches the fully-generated notification data.
This first stream, a list of pairs of ids and hashes, is used to indicate notifications which are new, deleted, and updated from our last poll.

## Pinghub

When notifications are generated or deleted on WordPress.com they will be announced over a Pinghub channel.
When we receive such an announcement, which is a minimal representation of the notification, we need to turn around and fetch the generated notification data (or delete it altogether) through a normal API fetch.
