/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import NewBlogCard from '../card';
import type { NewBlogRec } from '../tracks';

const mockRecordNewBlogRender = jest.fn();
jest.mock( '../tracks', () => ( {
	recordNewBlogRender: ( ...args: unknown[] ) => mockRecordNewBlogRender( ...args ),
} ) );
const mockPost = {
	ID: 10,
	site_ID: 1,
	feed_ID: 2,
	title: 'A post',
	URL: 'https://example.com/a-post',
};
jest.mock( 'calypso/reader/data/post', () => ( {
	usePost: () => ( { data: mockPost, isLoading: false } ),
} ) );
jest.mock( 'calypso/reader/data/site', () => ( { useSite: () => ( { site: undefined } ) } ) );
jest.mock( 'calypso/reader/data/feed', () => ( { useFeedQuery: () => ( { data: undefined } ) } ) );
jest.mock( 'calypso/reader/follow-button', () => () => <button>Subscribe</button> );
jest.mock( 'calypso/blocks/site-icon', () => ( { SiteIcon: () => null } ) );
jest.mock( 'calypso/blocks/reader-excerpt', () => () => null );
jest.mock( 'calypso/reader/get-helpers', () => ( { getSiteName: () => 'A blog' } ) );
jest.mock( 'calypso/reader/route', () => ( { getStreamUrl: () => '/reader/feeds/2' } ) );
jest.mock( 'calypso/reader/utils', () => ( { showSelectedPost: () => () => {} } ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );
jest.mock( '@wordpress/components', () => ( {
	Button: ( props: { label: string; onClick: () => void } ) => (
		<button onClick={ props.onClick }>{ props.label }</button>
	),
} ) );

const rec: NewBlogRec = {
	blogId: 1,
	postId: 10,
	score: 1,
	railcar: {
		railcar: 'railcar-1',
		fetch_algo: 'cluster_rec_v0',
		fetch_position: 1,
		rec_blog_id: 1,
		rec_post_id: 10,
	},
};

describe( 'NewBlogCard', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'records one render the first time the card is on screen', () => {
		const onImpression = jest.fn();
		render(
			<ul>
				<NewBlogCard
					rec={ rec }
					uiPosition={ 1 }
					onDismiss={ jest.fn() }
					onOpen={ jest.fn() }
					onFollowToggle={ jest.fn() }
					onImpression={ onImpression }
				/>
			</ul>
		);
		expect( mockRecordNewBlogRender ).not.toHaveBeenCalled();

		mockAllIsIntersecting( true );
		expect( mockRecordNewBlogRender ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordNewBlogRender ).toHaveBeenCalledWith( rec, 1 );
		expect( onImpression ).toHaveBeenCalledTimes( 1 );

		// Scrolling away and back doesn't record it again.
		mockAllIsIntersecting( false );
		mockAllIsIntersecting( true );
		expect( mockRecordNewBlogRender ).toHaveBeenCalledTimes( 1 );
		expect( onImpression ).toHaveBeenCalledTimes( 1 );
	} );
} );
