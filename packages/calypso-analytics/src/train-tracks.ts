/**
 * External Dependencies
 */
import { v4 as uuid } from 'uuid';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from './tracks';

interface TrainTracksRenderProps {
	railcarId: string;
	uiAlgo: string;
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

export function getNewRailcarId( suffix = 'recommendation' ) {
	return `${ uuid().replace( /-/g, '' ) }-${ suffix }`;
}
