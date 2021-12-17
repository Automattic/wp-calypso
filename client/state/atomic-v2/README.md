# Atomic Transfers

Used for initiating and tracking the status of Atomic transfers and software set installs. See also: client/state/data-layer/wpcom/sites/atomic

## Selectors

getSoftwareStatus
getLatestTransfer

```
import {
	installSoftware,
	fetchSoftwareStatus
} from 'calypso/state/atomic/software';
```

## Example usage

```
import {
	installSoftware,
	fetchSoftwareStatus
} from 'calypso/state/atomic/software';

import {
	initiateTransfer,
	fetchLatestTransfer
} from 'calypso/state/atomic/transfers';
```
