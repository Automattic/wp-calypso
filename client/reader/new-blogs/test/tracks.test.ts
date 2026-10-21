import {
	getNewRailcarId,
	recordTrainTracksInteract,
	recordTrainTracksRender,
} from '@automattic/calypso-analytics';
import {
	NEW_BLOGS_ACTIONS,
	NEW_BLOGS_FETCH_ALGO,
	NEW_BLOGS_UI_ALGO,
	buildRailcar,
	recordNewBlogInteract,
	recordNewBlogRender,
} from '../tracks';
import type { ReadNewBlogsRec } from '@automattic/api-core';

jest.mock( '@automattic/calypso-analytics', () => ( {
	getNewRailcarId: jest.fn( () => 'abc123-recommendation' ),
	recordTrainTracksRender: jest.fn(),
	recordTrainTracksInteract: jest.fn(),
} ) );

const bare: ReadNewBlogsRec = { blogId: 7, postId: 70, score: 0.5 };

describe( 'new-blogs tracks', () => {
	afterEach( () => jest.clearAllMocks() );

	test( 'buildRailcar mints an id and stamps the recommender + rank', () => {
		expect( buildRailcar( bare, 3 ) ).toEqual( {
			railcar: 'abc123-recommendation',
			fetch_algo: NEW_BLOGS_FETCH_ALGO,
			fetch_position: 3,
			rec_blog_id: 7,
			rec_post_id: 70,
		} );
		expect( getNewRailcarId ).toHaveBeenCalledWith( 'recommendation' );
	} );

	test( 'recordNewBlogRender maps the railcar onto a traintracks render', () => {
		const rec = { ...bare, railcar: buildRailcar( bare, 3 ) };
		recordNewBlogRender( rec, 1 );
		expect( recordTrainTracksRender ).toHaveBeenCalledWith( {
			railcarId: 'abc123-recommendation',
			uiAlgo: NEW_BLOGS_UI_ALGO,
			uiPosition: 1,
			fetchAlgo: NEW_BLOGS_FETCH_ALGO,
			fetchPosition: 3,
			recBlogId: '7',
			recPostId: '70',
		} );
	} );

	test( 'recordNewBlogInteract records the action against the railcar', () => {
		const rec = { ...bare, railcar: buildRailcar( bare, 3 ) };
		recordNewBlogInteract( rec, NEW_BLOGS_ACTIONS.SITE_DISMISSED );
		expect( recordTrainTracksInteract ).toHaveBeenCalledWith( {
			railcarId: 'abc123-recommendation',
			action: 'recommended_site_dismissed',
		} );
	} );
} );
