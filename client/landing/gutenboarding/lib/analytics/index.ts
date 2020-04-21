/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import { FLOW_ID } from '../../constants';

/**
 * Make tracks call with embedded flow.
 *
 * @param {string} eventId The name/id of the tracks event. Must be in snake_case and prefixed with "calypso" e.g. `calypso_something_snake_case`
 * @param {object} params A set of params to pass to analytics
 * @param {string} flow (Optional) The id of the flow, e.g., 'gutenboarding'
 */
export function trackEventWithFlow( eventId: string, params = {}, flow = FLOW_ID ): void {
	recordTracksEvent( eventId, {
		flow,
		...params,
	} );
}

/**
 * Analytics call at the start of the Gutenboarding flow
 *
 * @param {string} ref  The value of a `ref` query parameter, usually set by marketing landing pages
 */
export function recordOnboardingStart( ref = '' ): void {
	if ( ! ref ) {
		ref = new URLSearchParams( window.location.search ).get( 'ref' ) || ref;
	}
	trackEventWithFlow( 'calypso_signup_start', { ref } );
}

/**
 * Analytics call at the completion  of a Gutenboarding flow
 *
 * @param {object} params A set of params to pass to analytics for signup completion
 * @param {boolean} params.isNewUser Whether the user is newly signed up
 * @param {boolean} params.isNewSite Whether a new site is created in the flow
 */
export function recordOnboardingComplete( { isNewUser = false, isNewSite = true } ): void {
	trackEventWithFlow( 'calypso_signup_complete', {
		is_new_user: isNewUser,
		is_new_site: isNewSite,
	} );
}

interface TrainTracksRenderProps {
	trainTracksType: 'render';
	railcarId: string;
	uiAlgo: string;
	uiPosition: number;
	fetchAlgo: string;
	result: string;
	query: string;
}

interface TrainTracksInteractProps {
	trainTracksType: 'interact';
	railcarId: string;
	action: string;
}

export function recordTrainTracksRender( {
	railcarId,
	uiAlgo,
	uiPosition,
	fetchAlgo,
	result,
	query,
}: TrainTracksRenderProps ) {
	recordTracksEvent( 'calypso_traintracks_render', {
		railcar: railcarId,
		ui_algo: uiAlgo,
		ui_position: uiPosition,
		fetch_algo: fetchAlgo,
		rec_result: result,
		fetch_query: query,
	} );
}

export function recordTrainTracksInteract( { railcarId, action }: TrainTracksInteractProps ) {
	recordTracksEvent( 'calypso_traintracks_interact', {
		railcar: railcarId,
		action,
	} );
}

export type RecordTrainTracksEventProps =
	| Omit< TrainTracksRenderProps, 'uiAlgo' >
	| TrainTracksInteractProps;

export function recordTrainTracksEvent( uiAlgo: string, event: RecordTrainTracksEventProps ) {
	if ( event.trainTracksType === 'render' ) {
		recordTrainTracksRender( { ...event, uiAlgo } );
	}
	if ( event.trainTracksType === 'interact' ) {
		recordTrainTracksInteract( event );
	}
}

export function getNewRailcarId( suffix = 'suggestion' ) {
	return `${ uuid().replace( /-/g, '' ) }-${ suffix }`;
}
