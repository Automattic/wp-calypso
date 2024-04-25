import { AgencyDetailsPayload } from '../../agency-details-form/types';

export const verifySignupData = ( data: AgencyDetailsPayload | null ) => {
	if ( ! data ) {
		return false;
	}

	return true;
};
