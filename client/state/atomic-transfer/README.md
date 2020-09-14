# Atomic Transfer State Information

Atomic transfers are ongoing stateful processes.
The information in this state subtree tracks that process and provides the necessary information to represent it visually.

All Atomic transfer information is stored as a single possible transfer per site.

## Actions

|             action              | description                                              |
| :-----------------------------: | -------------------------------------------------------- |
|      `fetchAtomicTransfer`      | returns an `ATOMIC_TRANSFER_REQUEST` action type         |
| `atomicTransferFetchingFailure` | returns an `ATOMIC_TRANSFER_REQUEST_FAILURE` action type |
|    `atomicTransferComplete`     | returns an `ATOMIC_TRANSFER_COMPLETE` action type        |
|       `setAtomicTransfer`       | returns an `ATOMIC_TRANSFER_SET` action type             |

## Data types and meaning

### `status`

The status of an automated transfer represents where in the transfer process a given site may be.
The highest-level values of the status are _has never attempted to transfer_, _is transferring_, and _has transferred_.
However, inside of _is transferring_ there are many sub-states that are more granular in the process tracking.

|   status    | meaning                                                        |
| :---------: | -------------------------------------------------------------- |
|  `PENDING`  | A Transfer record was created but the transfer has not started |
|  `ACTIVE`   | A transfer is in progress                                      |
| `COMPLETED` | The transfer has completed and the Atomic site is ready        |
|   `ERROR`   | The transfer failed                                            |
| `REVERTED`  | The transfer was reverted                                      |
|  _falsey_   | No information about any transfers exists in Calypso           |
