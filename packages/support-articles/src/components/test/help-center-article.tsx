/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render } from '@testing-library/react';
import React from 'react';
import { HelpCenterArticle } from '../help-center-article';

const post = {
	ID: 185130,
	URL: 'https://en.support.wordpress.com/domains/',
	site_ID: 9619154,
	content: '<p>Article</p>',
	source: '/support',
};

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useSearchParams: () => [ new URLSearchParams( { link: post.URL, query: 'domains' } ) ],
} ) );

jest.mock( '../../hooks/use-post-by-url', () => ( {
	usePostByUrl: () => ( { data: post, isLoading: false, error: null } ),
} ) );

jest.mock( '../../hooks/use-help-center-article-tab-component', () => ( {
	useHelpCenterArticleTabComponent: () => undefined,
} ) );

jest.mock( '../../hooks/use-help-center-article-scroll', () => ( {
	useHelpCenterArticleScroll: () => undefined,
} ) );

jest.mock( '../help-center-article/help-center-article-content', () => ( {
	__esModule: true,
	default: () => <div>content</div>,
} ) );

jest.mock( '../back-to-top-button', () => ( {
	BackToTopButton: () => null,
} ) );

beforeAll( () => {
	// jsdom has no IntersectionObserver; the section-view effect constructs one on mount.
	window.IntersectionObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof IntersectionObserver;
} );

function renderArticle( siteId?: number | string ) {
	return render(
		<HelpCenterArticle
			sectionName="help-center"
			isEligibleForChat={ false }
			forceEmailSupport={ false }
			siteId={ siteId }
		/>
	);
}

describe( 'HelpCenterArticle analytics', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'reports the support site as blog_id and the docs blog separately', () => {
		renderArticle( 217279297 );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_helpcenter_article_viewed',
			expect.objectContaining( {
				blog_id: 217279297,
				article_blog_id: 9619154,
				post_id: 185130,
				site_context_source: 'support_site',
			} )
		);
	} );

	it( 'reports no site rather than falling back to the article blog', () => {
		renderArticle( undefined );

		const [ , properties ] = ( recordTracksEvent as jest.Mock ).mock.calls.find(
			( [ name ] ) => name === 'calypso_helpcenter_article_viewed'
		);

		expect( properties ).toEqual(
			expect.objectContaining( {
				article_blog_id: 9619154,
				site_context_source: 'none',
			} )
		);
		expect( properties ).not.toHaveProperty( 'blog_id' );
	} );
} );
