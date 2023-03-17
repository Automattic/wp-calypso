import { statusMapping } from './constants';
import {
	State,
	TransferEligibilityWarning,
	TransferEligibilityHold,
	TransferEligibility,
} from './types';

export const getAutomatedTransferEligibility = (
	state: State,
	siteId: number | null
): TransferEligibility | null => {
	if ( ! siteId ) {
		return null;
	}
	return state[ siteId ];
};

export const getEligibilityHolds = (
	state: State,
	siteId: number | null
): TransferEligibilityHold[] | null => {
	const transferEligibility = getAutomatedTransferEligibility( state, siteId );

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
};

export const getEligibilityWarnings = (
	state: State,
	siteId: number | null
): TransferEligibilityWarning[] | null => {
	const transferEligibility = getAutomatedTransferEligibility( state, siteId );

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
};

export const getNonSubdomainWarnings = (
	state: State,
	siteId: number | null
): TransferEligibilityWarning[] | null => {
	const eligibilityWarnings = getEligibilityWarnings( state, siteId );
	return eligibilityWarnings?.filter( ( { id } ) => id !== 'wordpress_subdomain' ) ?? null;
};

export const getWpcomSubdomainWarning = (
	state: State,
	siteId: number | null
): TransferEligibilityWarning | null => {
	const eligibilityWarnings = getEligibilityWarnings( state, siteId );
	return eligibilityWarnings?.find( ( { id } ) => id === 'wordpress_subdomain' ) ?? null;
};
