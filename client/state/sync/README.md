# Site Sync State Information

Site Sync is an ongoing stateful processes. The information in this state subtree tracks that
process and provides the necessary information to represent it visually.

All site sync information is stored as a single possible transfer per site. That is to say, state
information is keyed by site ID and if records for multiple actual transfer attempts exist on the
server only one will exist in Calypso (this shall be the most recent data available).

## Data types and meaning

### `status`

The status of a site sync represents where in the sync process a given site may be. The
highest-level values of the status are _has never attempted to sync_, _is syncing_, and _has
synced_. However, inside of _is syncing_ there are many sub-states that are more granular in the
process tracking.

|   status    | meaning                                                        |
| :---------: | -------------------------------------------------------------- |
|  `PENDING`  | A site sync job has been started and is currently in progress. |
|  `BACKUP`   | The sync is backing up we wait for the backups to complete.    |
| `COMPLETED` | The sync has been completed.                                   |
|  `RESTORE`  | The sync is restoring and we wait for the restore to complete. |
|  `FAILED`   | The sync has failed.                                           |
|  _falsey_   | No information about any site syncs exists in Calypso          |
