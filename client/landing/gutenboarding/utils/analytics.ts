/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { v4 as uuid } from 'uuid';

interface TrainTracksRenderProps {
	railcarId: string;
	uiPosition: number;
	fetchAlgo: string;
	result: string;
	query: string;
}

interface TrainTracksInteractProps {
	railcarId: string;
	action: string;
}

export function recordTrainTracksRender( {
	railcarId,
	uiPosition,
	fetchAlgo,
	result,
	query,
}: TrainTracksRenderProps ) {
	recordTracksEvent( 'calypso_traintracks_render', {
		railcar: railcarId,
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

export function getNewRailcarId( suffix = 'suggestion' ) {
	return `${ uuid().replace( /-/g, '' ) }-${ suffix }`;
}
