# useWooCommerceOnPlansEligibility

Custom React hook to process eligibility data to provide a clear object to deal with the woocommerce-install flow.

## Usage

```es6
import useWooCommerceOnPlansEligibility from '../hooks/use-eligibility';

function WordPressSubdomainWarningCard() {
	const { wpcomSubdomainWarning, stagingDomain } = useWooCommerceOnPlansEligibility( siteId );

	if ( ! wpcomSubdomainWarning ) {
		return null;
	}

	return (
		<div className="card is-warning">
			Domain is going to change to { stagingDomain }.
		</div>
	);
}

## API

The hook returns an object with the following properties:

### eligibilityHolds

### eligibilityWarnings

### wpcomDomain

### stagingDomain

### wpcomSubdomainWarning

### transferringBlockers

### isTransferringBlocked

### siteUpgrading

### isReadyToStart

### isDataReady
```
