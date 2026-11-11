/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HelpCenterRequiredContextProvider } from '../../contexts/HelpCenterContext';
import { useRedirectToArticle } from '../use-redirect-to-article';
import type { SearchResult } from '../../types';

const mockNavigate = jest.fn();

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: jest.fn(),
} ) );

const site = { ID: 111, URL: 'https://example.com', name: 'Example' };

function wrapper( { children }: { children: React.ReactNode } ) {
	return (
		<MemoryRouter>
			<HelpCenterRequiredContextProvider
				value={ {
					site: site as never,
					currentRoute: '/',
					sectionName: 'help-center',
				} }
			>
				{ children }
			</HelpCenterRequiredContextProvider>
		</MemoryRouter>
	);
}

function clickEvent() {
	return { preventDefault: jest.fn() } as unknown as React.MouseEvent<
		HTMLAnchorElement,
		MouseEvent
	>;
}

const resultWithoutPostId = {
	link: 'https://en.support.wordpress.com/domains/',
	title: 'Domains',
	blog_id: 9619154,
} as SearchResult;

describe( 'useRedirectToArticle', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.open = jest.fn();
	} );

	it( 'reports the article blog separately from the support site', () => {
		const { result } = renderHook( () => useRedirectToArticle( { searchQuery: 'domains' } ), {
			wrapper,
		} );

		result.current( clickEvent(), resultWithoutPostId );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_inlinehelp_article_no_postid_redirect',
			expect.objectContaining( {
				search_query: 'domains',
				result_url: 'https://en.support.wordpress.com/domains/',
				article_blog_id: 9619154,
				blog_id: 111,
				site_context_source: 'help_center_context',
			} )
		);
		expect( window.open ).toHaveBeenCalledWith( resultWithoutPostId.link, '_blank' );
	} );

	it( 'prefers an explicitly selected support site', () => {
		const { result } = renderHook(
			() => useRedirectToArticle( { searchQuery: 'domains', explicitSiteId: 222 } ),
			{ wrapper }
		);

		result.current( clickEvent(), resultWithoutPostId );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_inlinehelp_article_no_postid_redirect',
			expect.objectContaining( { blog_id: 222, site_context_source: 'explicit' } )
		);
	} );

	it( 'opens results that have a post id inside the Help Center without recording', () => {
		const { result } = renderHook( () => useRedirectToArticle( { searchQuery: 'domains' } ), {
			wrapper,
		} );

		result.current( clickEvent(), {
			...resultWithoutPostId,
			post_id: 185130,
		} as SearchResult );

		expect( recordTracksEvent ).not.toHaveBeenCalled();
		expect( window.open ).not.toHaveBeenCalled();
		expect( mockNavigate ).toHaveBeenCalledWith(
			expect.stringContaining( 'postId=185130&query=domains' )
		);
		expect( mockNavigate ).toHaveBeenCalledWith( expect.stringContaining( 'blogId=9619154' ) );
	} );
} );
