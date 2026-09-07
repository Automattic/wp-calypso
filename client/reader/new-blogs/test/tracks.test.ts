import {
	getNewRailcarId,
	recordTrainTracksInteract,
	recordTrainTracksRender,
} from '@automattic/calypso-analytics';
import {
	OON_ACTIONS,
	OON_FETCH_ALGO,
	OON_UI_ALGO,
	buildRailcar,
	recordOonInteract,
	recordOonRender,
} from '../tracks';
import type { OonRec } from '../types';

jest.mock( '@automattic/calypso-analytics', () => ( {
	getNewRailcarId: jest.fn( () => 'abc123-recommendation' ),
	recordTrainTracksRender: jest.fn(),
	recordTrainTracksInteract: jest.fn(),
} ) );

const bare: OonRec = { blogId: 7, postId: 70, score: 0.5 };

describe( 'new-blogs tracks', () => {
	afterEach( () => jest.clearAllMocks() );

	test( 'buildRailcar mints an id and stamps the recommender + rank', () => {
		expect( buildRailcar( bare, 3 ) ).toEqual( {
			railcar: 'abc123-recommendation',
			fetch_algo: OON_FETCH_ALGO,
			fetch_position: 3,
			rec_blog_id: 7,
			rec_post_id: 70,
		} );
		expect( getNewRailcarId ).toHaveBeenCalledWith( 'recommendation' );
	} );

	test( 'recordOonRender maps the railcar onto a traintracks render', () => {
		const rec = { ...bare, railcar: buildRailcar( bare, 3 ) };
		recordOonRender( rec, 1 );
		expect( recordTrainTracksRender ).toHaveBeenCalledWith( {
			railcarId: 'abc123-recommendation',
			uiAlgo: OON_UI_ALGO,
			uiPosition: 1,
			fetchAlgo: OON_FETCH_ALGO,
			fetchPosition: 3,
			recBlogId: '7',
			recPostId: '70',
		} );
	} );

	test( 'recordOonInteract records the action against the railcar', () => {
		const rec = { ...bare, railcar: buildRailcar( bare, 3 ) };
		recordOonInteract( rec, OON_ACTIONS.SITE_DISMISSED );
		expect( recordTrainTracksInteract ).toHaveBeenCalledWith( {
			railcarId: 'abc123-recommendation',
			action: 'recommended_site_dismissed',
		} );
	} );

	test( 'nothing is recorded for a rec without a railcar', () => {
		recordOonRender( bare, 0 );
		recordOonInteract( bare, OON_ACTIONS.POST_CLICKED );
		expect( recordTrainTracksRender ).not.toHaveBeenCalled();
		expect( recordTrainTracksInteract ).not.toHaveBeenCalled();
	} );
} );
