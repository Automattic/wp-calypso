import { statusMapping } from './constants';
import { TransferEligibilityWarning, TransferEligibilityHold, TransferEligibility } from './types';

export function getEligibilityHolds(
	transferEligibility: TransferEligibility | null
): TransferEligibilityHold[] | null {
	if ( ! transferEligibility?.errors ) {
		return null;
	}

	return transferEligibility.errors.reduce< TransferEligibilityHold[] >( ( errs, { code } ) => {
		if ( code in statusMapping ) {
			// At this point, we know code is a key of statusMapping, so we help TS understand that.
			errs.push( statusMapping[ code as keyof typeof statusMapping ] );
		}
		return errs;
	}, [] );
}

export function getEligibilityWarnings(
	transferEligibility: TransferEligibility | null
): TransferEligibilityWarning[] | null {
	if ( ! transferEligibility?.warnings ) {
		return null;
	}

	// combine plugin and theme warnings into one list
	const combined = Object.values( transferEligibility.warnings ).flat();

	return combined.map( ( { description, name, supportUrl, id } ) => ( {
		id,
		name,
		description,
		supportUrl,
	} ) );
}

export function getNonSubdomainWarnings( transferEligibility: TransferEligibility | null ) {
	return (
		getEligibilityWarnings( transferEligibility )?.filter(
			( { id } ) => id !== 'wordpress_subdomain'
		) ?? null
	);
}

export function getWpcomSubdomainWarning( transferEligibility: TransferEligibility | null ) {
	return (
		getEligibilityWarnings( transferEligibility )?.find(
			( { id } ) => id === 'wordpress_subdomain'
		) ?? null
	);
}
