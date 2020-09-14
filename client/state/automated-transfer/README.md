# Automated Transfer State Information

Automated transfers are ongoing stateful processes.
The information in this state subtree tracks that process and provides the necessary information to represent it visually.

All automated transfer information is stored as a single possible transfer per site.
That is to say, state information is keyed by site ID and if records for multiple actual transfer attempts exist on the server only one will exist in Calypso (this shall be the most recent data available).

## Data types and meaning

### `status`

The status of an automated transfer represents where in the transfer process a given site may be.
The highest-level values of the status are _has never attempted to transfer_, _is transferring_, and _has transferred_.
However, inside of _is transferring_ there are many sub-states that are more granular in the process tracking.

|   status    | meaning                                                                                        |
| :---------: | ---------------------------------------------------------------------------------------------- |
| `COMPLETE`  | Records exist for a transfer but it has previously finished                                    |
| `CONFLICTS` | No transfer can be created because there are known conflicts preventing a success transfer     |
| `INQUIRING` | Calypso has requested information about starting a transfer but none has actually been created |
|   `START`   | A transfer has been created and is currently in progress                                       |
|  _falsey_   | No information about any transfers exists in Calypso                                           |
