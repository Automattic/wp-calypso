# Staging Site Transfer Status Information

In this reducer, we store the automated-transfer status for the staging site.

## Data Types and Meanings

### `status`

This represents the status of the transfer when the creation or deletion of a staging site is in progress.
Since we are primarily concerned with the sequence: start -> in progress -> end, we've simplified the reducer to only store that specific information.
In addition to simplifying the stored data, another reason we've created another reducer, is to store information into the production site ID instead.
This is because the staging site is unavailable from the start of the transferring process.

|         Status          | Meaning                                                                                          |
| :---------------------: | ------------------------------------------------------------------------------------------------ |
|       `COMPLETE`        | Records exist for a transfer, and it has previously finished.                                    |
|       `REVERTING`       | We have information from the backend indicating that the staging site revert process is ongoing. |
|       `REVERTED`        | The staging site has been deleted successfully.                                                  |
|     `TRANSFERRING`      | The transfer to atomic is in progress.                                                           |
|  `INITIATE_REVERTING`   | A revert operation has been initiated (no automated-transfer data exists yet on the client).     |
| `INITIATE_TRANSFERRING` | A transfer operation has been initiated (no automated-transfer data exists yet on the client).   |
|        _falsey_         | No information about any transfers exists in Calypso.                                            |

---
