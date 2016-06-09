import debugFactory from 'debug';
import map from 'lodash/map';

import {
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_TRIAL_CANCEL_COMPLETED,
	SITE_PLANS_TRIAL_CANCEL_FAILED
} from 'state/action-types';
import { createSitePlanObject } from './assembler';
import { fetchSitePlansCompleted } from './actions';
import i18n from 'i18n-calypso';

const debug = debugFactory( 'calypso:site-plans:connections' );

export const connectCancelSitePlanTrial = wpcom => ( action, dispatch ) => {
	return new Promise( ( resolve, reject ) => {
		wpcom.undocumented().cancelPlanTrial( action.planId, ( error, data ) => {
			if ( data && data.success ) {
				dispatch( {
					type: SITE_PLANS_TRIAL_CANCEL_COMPLETED,
					siteId: action.siteId,
					plans: map( data.plans, createSitePlanObject )
				} );

				resolve();
			} else {
				debug( 'Canceling site plan trial failed: ', error );

				const errorMessage = error.message || i18n.translate( 'There was a problem canceling the plan trial. Please try again later or contact support.' );

				dispatch( {
					type: SITE_PLANS_TRIAL_CANCEL_FAILED,
					siteId: action.siteId,
					error: errorMessage
				} );

				reject( errorMessage );
			}
		} );
	} );
}

export const connectFetchSitePlans = wpcom => ( action, dispatch ) =>
	wpcom.undocumented().getSitePlans( action.siteId, ( error, data ) => {
			if ( error ) {
				debug( 'Fetching site plans failed: ', error );

				const errorMessage = error.message || i18n.translate( 'There was a problem fetching site plans. Please try again later or contact support.' );

				dispatch( {
					type: SITE_PLANS_FETCH_FAILED,
					siteId: action.siteId,
					error: errorMessage
				} );
			} else {
				dispatch( fetchSitePlansCompleted( action.siteId, data ) );
			}
		}
	);
