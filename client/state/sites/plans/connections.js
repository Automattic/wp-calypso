import wpcom from 'lib/wp';
import debugFactory from 'debug';
import map from 'lodash/map';

import {
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_TRIAL_CANCEL_COMPLETED,
	SITE_PLANS_TRIAL_CANCEL_FAILED
} from 'state/action-types';
import { createSitePlanObject } from './assembler';
import { fetchSitePlansCompleted } from './actions';
import i18n from 'lib/mixins/i18n';

const debug = debugFactory( 'calypso:site-plans:connections' );

export function connectCancelSitePlanTrial( action, dispatch ) {
	return new Promise( ( resolve, reject ) => {
		wpcom.undocumented().cancelPlanTrial( planId, ( error, data ) => {
			if ( data && data.success ) {
				dispatch( {
					type: SITE_PLANS_TRIAL_CANCEL_COMPLETED,
					siteId,
					plans: map( data.plans, createSitePlanObject )
				} );

				resolve();
			} else {
				debug( 'Canceling site plan trial failed: ', error );

				const errorMessage = error.message || i18n.translate( 'There was a problem canceling the plan trial. Please try again later or contact support.' );

				dispatch( {
					type: SITE_PLANS_TRIAL_CANCEL_FAILED,
					siteId,
					error: errorMessage
				} );

				reject( errorMessage );
			}
		} );
	} );
}

export function connectFetchSitePlans( action, dispatch ) {
	return new Promise( ( resolve ) => {
		wpcom.undocumented().getSitePlans( siteId, ( error, data ) => {
			if ( error ) {
				debug( 'Fetching site plans failed: ', error );

				const errorMessage = error.message || i18n.translate( 'There was a problem fetching site plans. Please try again later or contact support.' );

				dispatch( {
					type: SITE_PLANS_FETCH_FAILED,
					siteId,
					error: errorMessage
				} );
			} else {
				dispatch( fetchSitePlansCompleted( siteId, data ) );
			}

			resolve();
		} );
	} );
}

