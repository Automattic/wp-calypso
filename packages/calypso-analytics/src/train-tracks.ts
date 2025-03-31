import { recordTracksEvent } from './tracks';

export type Railcar = {
	railcar: string;
	fetch_algo: string;
	fetch_lang: string;
	fetch_position: number;
	fetch_query?: string;
	rec_blog_id: string;
} & Record< string, string | number >;

interface TrainTracksRenderProps {
	railcarId: string;
	uiAlgo: string;
	uiPosition: number;
	fetchAlgo: string;
	fetchPosition?: number;
	result?: string;
	query?: string;
	recBlogId?: string;
	recPostId?: string;
	recFeedId?: string;
	recFeedItemId?: string;
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
	fetchPosition,
	query,
	result,
	recBlogId,
	recPostId,
	recFeedId,
	recFeedItemId,
}: TrainTracksRenderProps ) {
	const props: { [ key: string ]: string | number } = {};

	// Remap and filter undefined props
	Object.entries( {
		railcar: railcarId,
		ui_algo: uiAlgo,
		ui_position: uiPosition,
		fetch_algo: fetchAlgo,
		fetch_query: query,
		fetch_position: fetchPosition,
		rec_result: result,
		rec_blog_id: recBlogId,
		rec_post_id: recPostId,
		rec_feed_id: recFeedId,
		rec_feed_item_id: recFeedItemId,
	} ).forEach( ( [ key, val ] ) => val !== undefined && ( props[ key ] = val ) );

	recordTracksEvent( 'calypso_traintracks_render', props );
}

export function recordTrainTracksInteract( { railcarId, action }: TrainTracksInteractProps ) {
	recordTracksEvent( 'calypso_traintracks_interact', {
		railcar: railcarId,
		action,
	} );
}

export function getNewRailcarId( suffix = 'recommendation' ) {
	return `${ crypto.randomUUID().replace( /-/g, '' ) }-${ suffix }`;
}
