import { type } from 'calypso/lib/domains/constants';

export const filterOutWpcomDomains = ( domains ) => {
	// domain.type might be lowercase, but type.WPCOM is uppercase
	return domains.filter( ( domain ) => domain.type.toUpperCase() !== type.WPCOM );
};
