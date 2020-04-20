/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { v4 as uuid } from 'uuid';

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
