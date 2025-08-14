import type { Site } from '../data/types';

export const hasManageOptions = ( site: Site | undefined ) => {
	if ( ! site?.capabilities ) {
		return false;
	}

	return Boolean( site.capabilities.manage_options );
};
