import { select } from '@wordpress/data';
import { get } from 'lodash';
import { STORE_KEY, statusMapping } from './constants';
import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getAutomatedTransferEligibility = ( state: State, siteId: number | null ) => {
	if ( ! state.transferEligibility ) {
		return null;
	}

	return siteId && state.transferEligibility[ siteId ];
};

export const getEligibilityHolds = ( state: State, siteId: number | null ) => {
	const transferEligibility = select( STORE_KEY ).getAutomatedTransferEligibility( siteId );

	if ( ! transferEligibility ) {
		return null;
	}

	const { errors } = transferEligibility;

	if ( ! errors ) {
		return null;
	}

	errors.map( ( { code }: { code: string } ) => {
		return get( statusMapping, code, '' );
	} );

	return errors;
};

export const getEligibilityWarnings = ( state: State, siteId: number | null ) => {
	const transferEligibility = select( STORE_KEY ).getAutomatedTransferEligibility( siteId );

	if ( ! transferEligibility ) {
		return null;
	}

	const { warnings } = transferEligibility;

	if ( ! warnings ) {
		return null;
	}

	return Object.keys( warnings )
		.reduce( ( list, type ) => list.concat( warnings[ type ] ), [] ) // combine plugin and theme warnings into one list
		.map( ( { description, name, support_url, id } ) => ( {
			id,
			name,
			description,
			supportUrl: support_url,
		} ) );
};

export const getNonSubdomainWarnings = ( state: State, siteId: number | null ) => {
	const eligibilityWarnings = select( STORE_KEY ).getEligibilityWarnings( siteId );

	return eligibilityWarnings?.filter( ( { id } ) => id !== 'wordpress_subdomain' ) ?? [];
};

export const getWpcomSubdomainWarning = ( state: State, siteId: number | null ) => {
	const eligibilityWarnings = select( STORE_KEY ).getEligibilityWarnings( siteId );

	return eligibilityWarnings?.find( ( { id } ) => id === 'wordpress_subdomain' );
};

export const getLatestAtomicTransfer = ( state: State, siteId: number | null ) => {
	return state.latestAtomicTransfer && siteId && state.latestAtomicTransfer[ siteId ];
};
