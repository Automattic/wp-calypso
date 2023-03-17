import { statusMapping } from './constants';
import {
	State,
	TransferEligibilityWarning,
	TransferEligibilityError,
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
): TransferEligibilityError[] | null => {
	const transferEligibility = getAutomatedTransferEligibility( state, siteId );

	if ( ! transferEligibility ) {
		return null;
	}

	const { errors } = transferEligibility;

	if ( ! errors ) {
		return null;
	}

	return errors.map( ( { code } ) => {
		return { code: statusMapping[ code ] ?? '', message: '' };
	} );
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
