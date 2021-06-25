/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE,
	JETPACK_PARTNER_PORTAL_PARTNER_REQUEST,
	JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE_ERROR,
	JETPACK_PARTNER_PORTAL_PARTNER_RECEIVE,
} from 'calypso/state/action-types';
import { ReduxDispatch } from 'calypso/state/redux-store';
import {
	APIError,
	Partner,
	PartnerPortalStore,
	PartnerPortalThunkAction,
} from 'calypso/state/partner-portal/types';
import {
	getActivePartnerKey,
	getActivePartnerKeyId,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { wpcomJetpackLicensing } from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

// Required for modular state.
import 'calypso/state/partner-portal/init';

export function setActivePartnerKey( partnerKeyId: number ): PartnerPortalThunkAction {
	return ( dispatch: ReduxDispatch, getState: () => PartnerPortalStore ) => {
		if ( ! partnerKeyId || isFetchingPartner( getState() ) ) {
			return;
		}

		dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_ACTIVE_PARTNER_KEY_UPDATE, partnerKeyId } );

		const key = getActivePartnerKey( getState() );
		wpcomJetpackLicensing.loadToken( key ? key.oAuth2Token : '' );
	};
}

export function fetchPartner( dispatch: ReduxDispatch, getState: () => PartnerPortalStore ): void {
	if ( isFetchingPartner( getState() ) ) {
		return;
	}

	dispatch( { type: JETPACK_PARTNER_PORTAL_PARTNER_REQUEST } );
}

export function receivePartner( partner: Partner ): PartnerPortalThunkAction {
	return ( dispatch: ReduxDispatch, getState: () => PartnerPortalStore ): void => {
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
	};
}

export function receivePartnerError( error: APIError ): PartnerPortalThunkAction {
	return ( dispatch: ReduxDispatch ): void => {
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
