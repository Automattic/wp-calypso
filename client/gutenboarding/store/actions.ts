/**
 * External dependencies
 */
import { Action, ActionCreator } from 'redux';

/**
 * Internal dependencies
 */
import ActionTypes from './action-types';

export interface SetSiteTypeAction extends Action< ActionTypes.SET_SITE_TYPE > {
	payload: string;
}
export const setSiteType: ActionCreator< SetSiteTypeAction > = ( siteType: string ) => ( {
	type: ActionTypes.SET_SITE_TYPE,
	payload: siteType,
} );
