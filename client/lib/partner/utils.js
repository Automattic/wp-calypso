import config from '@automattic/calypso-config';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';

export const isAgencyUser = ( partner ) => {
	return partner?.partner_type === 'agency';
};

export const getShowAgencyDashboard = ( store ) => {
	const state = store.getState();
	let isAgency;
	if ( config.isEnabled( 'jetpack/agency-dashboard' ) ) {
		const partner = getCurrentPartner( state );
		isAgency = isAgencyUser( partner );
	}
	return isAgency;
};
