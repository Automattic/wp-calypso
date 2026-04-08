import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
// Required for modular state.
import 'calypso/state/a8c-for-agencies/init';
import {
	A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG,
	A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS,
} from 'calypso/a8c-for-agencies/sections/partner-directory/lib/lead-matching-visibility';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeActionOptions } from 'calypso/state/notices/types';
import { APIError, Agency, AgencyThunkAction, UserBillingType } from '../types';
import {
	JETPACK_GET_AGENCIES_ERROR,
	JETPACK_GET_AGENCIES_REQUEST,
	JETPACK_GET_AGENCIES_SUCCESS,
	JETPACK_CURRENT_AGENCY_UPDATE,
	JETPACK_SET_AGENCY_CLIENT_USER,
} from './action-types';
import { getActiveAgency, isFetchingAgency } from './selectors';
import type { LeadMatchingDetails } from 'calypso/a8c-for-agencies/sections/partner-directory/types';

export function setActiveAgency( agency: Agency ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		if ( ! agency || isFetchingAgency( getState() ) ) {
			return;
		}
		dispatch( { type: JETPACK_CURRENT_AGENCY_UPDATE, activeAgency: agency } );
	};
}

export function updateActiveAgencyLeadMatching( {
	draft,
	profile,
	sync,
}: {
	draft?: LeadMatchingDetails | null;
	profile?: NonNullable< Agency[ 'lead_matching' ] >[ 'profile' ];
	sync?: NonNullable< Agency[ 'lead_matching' ] >[ 'sync' ];
} ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		const agency = getActiveAgency( getState() );

		if ( ! agency || isFetchingAgency( getState() ) ) {
			return;
		}

		dispatch(
			setActiveAgency( {
				...agency,
				lead_matching: {
					...agency.lead_matching,
					...( draft !== undefined ? { draft } : {} ),
					...( profile !== undefined ? { profile } : {} ),
					...( sync !== undefined ? { sync } : {} ),
				},
			} )
		);
	};
}

export function updateActiveAgencyAvailability( isAvailable: boolean ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		const agency = getActiveAgency( getState() );

		if ( ! agency || isFetchingAgency( getState() ) ) {
			return;
		}

		dispatch(
			setActiveAgency( {
				...agency,
				profile: {
					...agency.profile,
					listing_details: {
						...agency.profile.listing_details,
						is_available: isAvailable,
					},
				},
				lead_matching: agency.lead_matching
					? {
							...agency.lead_matching,
							profile: agency.lead_matching.profile
								? {
										...agency.lead_matching.profile,
										availability: {
											...agency.lead_matching.profile.availability,
											accepting_work: isAvailable,
										},
								  }
								: agency.lead_matching.profile,
					  }
					: agency.lead_matching,
			} )
		);
	};
}

/**
 * Update the active agency's referrals logo URL in local state (e.g. after sending a referral with a custom logo).
 */
export function updateAgencyReferralsLogo( logoUrl: string ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		const agency = getActiveAgency( getState() );
		if ( ! agency ) {
			return;
		}
		dispatch( {
			type: JETPACK_CURRENT_AGENCY_UPDATE,
			activeAgency: { ...agency, referrals_logo: logoUrl },
		} );
	};
}

export function fetchAgencies(): AgencyThunkAction {
	return ( dispatch, getState ) => {
		if ( isFetchingAgency( getState() ) ) {
			return;
		}

		dispatch( {
			type: JETPACK_GET_AGENCIES_REQUEST,
		} );
	};
}

export function receiveAgencies( agencies: Agency[] ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		dispatch( {
			type: JETPACK_GET_AGENCIES_SUCCESS,
			agencies,
		} );

		const activeAgency = getActiveAgency( getState() );

		let newAgency = agencies[ 0 ]; // Default to the first id until we support multiple agencies.

		const foundActiveAgency = agencies.find( ( agency ) => agency.id === activeAgency?.id );

		if ( foundActiveAgency ) {
			// If the active agency id is for a valid agency, select it.
			newAgency = foundActiveAgency;
		}

		if ( newAgency ) {
			dispatch( setActiveAgency( newAgency ) );

			// Enable the a4a-bd-checkout feature flag if the billing system is 'billingdragon'
			if (
				! config.isEnabled( 'a4a-bd-checkout' ) &&
				newAgency.billing_system === 'billingdragon'
			) {
				config.enable( 'a4a-bd-checkout' );
			}

			// Enable the Partner Directory section
			if ( ! config.isEnabled( 'a4a-partner-directory' ) && newAgency.partner_directory.allowed ) {
				config.enable( 'a4a-partner-directory' );
			}

			if (
				! config.isEnabled( A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG ) &&
				A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS.has( newAgency.id )
			) {
				config.enable( A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG );
			}
		}
	};
}

export function setAgencyClientUser( {
	isClientUser,
	billingType,
}: {
	isClientUser: boolean;
	billingType: UserBillingType;
} ): AgencyThunkAction {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SET_AGENCY_CLIENT_USER,
			isClientUser,
			billingType,
		} );
	};
}

export function receiveAgenciesError( error: APIError ) {
	return (
		dispatch: ( arg0: {
			type: string;
			error?: { status: number; code: string; message: string };
			notice?: NoticeActionOptions;
		} ) => void
	) => {
		dispatch( {
			type: JETPACK_GET_AGENCIES_ERROR,
			error: {
				status: error.status,
				code: error.code || '',
				message: error.message,
			},
		} );
		dispatch( errorNotice( translate( 'We were unable to retrieve your agency details.' ) ) );
	};
}
