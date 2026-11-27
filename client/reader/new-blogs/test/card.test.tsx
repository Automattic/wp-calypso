/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { mockAllIsIntersecting } from 'calypso/test-helpers/intersection-observer';
import NewBlogCard from '../card';
import type { NewBlogRec } from '../tracks';

const mockRecordNewBlogRender = vi.fn();
vi.mock( '../tracks', () => ( {
	recordNewBlogRender: ( ...args: unknown[] ) => mockRecordNewBlogRender( ...args ),
} ) );
const mockPost = {
	ID: 10,
	site_ID: 1,
	feed_ID: 2,
	title: 'A post',
	URL: 'https://example.com/a-post',
};
vi.mock( 'calypso/reader/data/post', () => ( {
	usePost: () => ( { data: mockPost, isLoading: false } ),
} ) );
vi.mock( 'calypso/reader/data/site', () => ( { useSite: () => ( { site: undefined } ) } ) );
vi.mock( 'calypso/reader/data/feed', () => ( { useFeedQuery: () => ( { data: undefined } ) } ) );
vi.mock( 'calypso/reader/follow-button', () => ( { default: () => <button>Subscribe</button> } ) );
vi.mock( 'calypso/blocks/site-icon', () =>
	( ( m ) => ( { ...m, default: m } ) )( { SiteIcon: () => null } )
);
vi.mock( 'calypso/blocks/reader-excerpt', () => ( { default: () => null } ) );
vi.mock( 'calypso/reader/get-helpers', () => ( { getSiteName: () => 'A blog' } ) );
vi.mock( 'calypso/reader/route', () => ( { getStreamUrl: () => '/reader/feeds/2' } ) );
vi.mock( 'calypso/reader/utils', () => ( { showSelectedPost: () => () => {} } ) );
vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( str: string ) => str,
	} )
);
vi.mock( '@wordpress/components', () => ( {
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
	afterEach( () => vi.clearAllMocks() );

	it( 'records one render the first time the card is on screen', () => {
		const onImpression = vi.fn();
		render(
			<ul>
				<NewBlogCard
					rec={ rec }
					uiPosition={ 1 }
					onDismiss={ vi.fn() }
					onOpen={ vi.fn() }
					onFollowToggle={ vi.fn() }
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
