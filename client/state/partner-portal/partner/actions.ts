import { translate } from 'i18n-calypso';
import { wpcomJetpackLicensing } from 'calypso/lib/wp';
import {
	JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_OAUTH_TOKEN_SET,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR,
	JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE,
} from 'calypso/state/action-types';
import { setUserJetpackPartnerType } from 'calypso/state/current-user/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	getActivePartnerKey,
	getActivePartnerKeyId,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { APIError, Partner, PartnerPortalThunkAction } from 'calypso/state/partner-portal/types';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function setActivePartnerKey( partnerKeyId: number ): PartnerPortalThunkAction {
	return ( dispatch, getState ) => {
		if ( ! partnerKeyId || isFetchingPartner( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );

		const key = getActivePartnerKey( getState() );
		wpcomJetpackLicensing.loadToken( key ? key.oAuth2Token : '' );
		dispatch( { type: JETPACK_PARTNER_PORTAL_OAUTH_TOKEN_SET } );
	};
}

export function fetchPartner(): PartnerPortalThunkAction {
	return ( dispatch, getState ) => {
		if ( isFetchingPartner( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_REQUEST } );
	};
}

export function receivePartner( partner: Partner ): PartnerPortalThunkAction {
	return ( dispatch, getState ) => {
		dispatch( {
			type: JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE,
			partner,
		} );

		const activePartnerKeyId = getActivePartnerKeyId( getState() );
		const keys = partner.keys.map( ( key ) => key.id );
		let newKeyId = 0;

		if ( keys.length === 1 ) {
			// If we only get a single key, auto-select it for the user for simplicity.
			newKeyId = keys[ 0 ];
		}

		if ( keys.includes( activePartnerKeyId ) ) {
			// If the active key id is for a valid key, select it.
			newKeyId = activePartnerKeyId;
		}

		if ( newKeyId ) {
			dispatch( setActivePartnerKey( newKeyId ) );
		}

		// Set the correct partner type as it's used across the UI for conditional
		// displaying various components.
		dispatch( setUserJetpackPartnerType( partner?.partner_type ) );
	};
}

export function receivePartnerError( error: APIError ): PartnerPortalThunkAction {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR,
			error: {
				status: error.status,
				code: error.code || '',
				message: error.message,
			},
		} );

		if ( error.code !== 'no_partner_found' ) {
			dispatch(
				errorNotice( translate( 'We were unable to retrieve your partner account details.' ) )
			);
		}
	};
}
