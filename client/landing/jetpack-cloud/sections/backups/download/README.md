# Download Creation Flow ( `BackupDownloadPage` )

These are a set of Components for taking the user through the flow of creating a downloadable back up file ( if necessary ) and downloading it.

## Components

- `BackupDownloadPage` - The primary component that controls the flow. Only component connect to global state.
- `BackupDownloadConfirm` - Prompts the user to confirm the creation of a backup for the site
- `BackupDownloadInProgress` - Reports the progress of an in-progress download
- `BackupDownloadReady` - Presents the user with a download link for their backup
- `BackupDownloadError` - An unexpected state that we cannot handle with any of the other components

## The Flow

Control of the flow is completely dependent on the status the of `backupProgress` request or the state of `backupRequest`. There are four possible states that each render a different component:

### States

1. `backupProgress` does not exist for the site - `BackupDownloadConfirm`
2. `backupProgress` exists and the `progress` field exists and is a number - `BackupDownloadInProgress`
3. `backupProgress` exists and the `progress` field is `NaN` - `BackupDownloadReady`
4. Everything else - `BackupDownloadError`

It is entirely possible to enter this component at any of the states since it is completely dependent on the ser-side status of the downloadable backup creation.
