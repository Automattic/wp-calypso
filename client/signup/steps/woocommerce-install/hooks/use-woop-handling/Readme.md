# useEligibility

Custom React hook to process eligibility data to provide a clear object to deal with the woocommerce-install flow.

## Usage

```es6
import useEligibility from '../hooks/use-eligibility';

function WordPressSubdomainWarningCard() {
	const { wpcomSubdomainWarning, stagingDomain } = useEligibility( siteId );

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

### isFetching

### eligibilityHolds

### eligibilityWarnings

### wpcomDomain

### stagingDomain

### pluginsWarning

### widgetsWarning

### wpcomSubdomainWarning

### transferringBlockers

### hasBlockers

### siteUpgrading

