import { statusMapping } from './constants';
import { State, TransferEligibilityWarning, TransferEligibility } from './types';

export const getAutomatedTransferEligibility = (
	state: State,
	siteId: number | null
): TransferEligibility | null => {
	if ( ! siteId ) {
		return null;
	}
	return state[ siteId ];
};

export const getEligibilityHolds = ( state: State, siteId: number | null ): string[] | null => {
	const transferEligibility = getAutomatedTransferEligibility( state, siteId );

	if ( ! transferEligibility?.errors ) {
		return null;
	}

	return transferEligibility.errors.reduce< string[] >( ( errs, { code } ) => {
		if ( statusMapping[ code ] ) {
			errs.push( statusMapping[ code ] );
		}
		return errs;
	}, [] );
};

export const getEligibilityWarnings = (
	state: State,
	siteId: number | null
): TransferEligibilityWarning[] | null => {
	const transferEligibility = getAutomatedTransferEligibility( state, siteId );

	if ( ! transferEligibility ) {
		return null;
	}

	const { warnings } = transferEligibility;

	if ( ! warnings ) {
		return null;
	}

	// combine plugin and theme warnings into one list
	const combined = Object.values( warnings ).flat();

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

	if ( ! eligibilityWarnings ) {
		return null;
	}

	return eligibilityWarnings?.filter( ( { id } ) => id !== 'wordpress_subdomain' ) ?? null;
};

export const getWpcomSubdomainWarning = (
	state: State,
	siteId: number | null
): TransferEligibilityWarning | null => {
	const eligibilityWarnings = getEligibilityWarnings( state, siteId );

	const warning = eligibilityWarnings?.find( ( { id } ) => id === 'wordpress_subdomain' );
	return warning || null;
};
