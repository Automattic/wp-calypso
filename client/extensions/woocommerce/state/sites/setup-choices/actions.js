/**
 * Internal dependencies
 */
import {
	areSetupChoicesLoaded,
	areSetupChoicesLoading
} from './selectors';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS
} from 'woocommerce/state/action-types';
import wp from 'lib/wp';

export const fetchSetupChoices = ( siteId ) => ( dispatch, getState ) => {
	if ( areSetupChoicesLoading( getState(), siteId ) ) {
		return;
	}

	if ( areSetupChoicesLoaded( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SETUP_CHOICES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return wp.req.get( { path: `/sites/${ siteId }/calypso-preferences/woocommerce` } )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
