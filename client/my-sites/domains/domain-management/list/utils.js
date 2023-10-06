import { type } from 'calypso/lib/domains/constants';

export const filterOutWpcomDomains = ( domains ) => {
	return domains.filter( ( domain ) => domain.type !== type.WPCOM );
};
