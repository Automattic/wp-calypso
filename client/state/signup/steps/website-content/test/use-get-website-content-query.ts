/**
 * @jest-environment jsdom
 */
import { HOME_PAGE, ABOUT_PAGE, CONTACT_PAGE, CUSTOM_PAGE } from 'calypso/signup/difm/constants';
import { selectWebsiteContent } from '../hooks/use-get-website-content-query';
import type { WebsiteContentResponseDTO } from '../types';

const baseResponse: WebsiteContentResponseDTO = {
	pages: [],
	site_logo_url: '',
	generic_feedback: '',
	search_terms: '',
	selected_page_titles: [],
	is_website_content_submitted: false,
	is_store_flow: false,
};

describe( 'selectWebsiteContent', () => {
	test( 'uses server-provided selected_page_instances when present', () => {
		const result = selectWebsiteContent( {
			...baseResponse,
			selected_page_titles: [ HOME_PAGE, CUSTOM_PAGE ],
			selected_page_instances: [
				{ id: 'srv-home', type: HOME_PAGE },
				{ id: 'srv-custom', type: CUSTOM_PAGE, title: 'My Custom' },
			],
			pages: [
				{ id: 'srv-home', title: 'Home', content: 'home c', media: [], use_filler_content: false },
				{
					id: 'srv-custom',
					title: 'My Custom',
					content: 'custom c',
					media: [],
					use_filler_content: false,
				},
			],
		} );
		expect( result.selectedPageInstances ).toEqual( [
			{ id: 'srv-home', type: HOME_PAGE },
			{ id: 'srv-custom', type: CUSTOM_PAGE, title: 'My Custom' },
		] );
	} );

	test( 'pairs pages with selected_page_titles positionally when instances are omitted (HAPD-3969 repro)', () => {
		const result = selectWebsiteContent( {
			...baseResponse,
			selected_page_titles: [ HOME_PAGE, ABOUT_PAGE, CUSTOM_PAGE, CUSTOM_PAGE, CUSTOM_PAGE ],
			pages: [
				{ id: 'uuid-1', title: 'Home', content: '', media: [], use_filler_content: false },
				{ id: 'uuid-2', title: 'About', content: '', media: [], use_filler_content: false },
				{
					id: 'uuid-3',
					title: 'Custom page 1 test 2',
					content: 'Custom page 1 test 2',
					media: [],
					use_filler_content: false,
				},
				{ id: 'uuid-4', title: '', content: '', media: [], use_filler_content: false },
				{ id: 'uuid-5', title: '', content: '', media: [], use_filler_content: false },
			],
		} );
		expect( result.selectedPageInstances ).toEqual( [
			{ id: 'uuid-1', type: HOME_PAGE, title: 'Home' },
			{ id: 'uuid-2', type: ABOUT_PAGE, title: 'About' },
			{ id: 'uuid-3', type: CUSTOM_PAGE, title: 'Custom page 1 test 2' },
			{ id: 'uuid-4', type: CUSTOM_PAGE },
			{ id: 'uuid-5', type: CUSTOM_PAGE },
		] );
	} );

	test( 'returns undefined selectedPageInstances when pages and titles length diverge', () => {
		const result = selectWebsiteContent( {
			...baseResponse,
			selected_page_titles: [ HOME_PAGE, ABOUT_PAGE, CONTACT_PAGE ],
			pages: [ { id: 'uuid-1', title: 'Home', content: '', media: [], use_filler_content: false } ],
		} );
		expect( result.selectedPageInstances ).toBeUndefined();
		expect( result.selectedPageTitles ).toEqual( [ HOME_PAGE, ABOUT_PAGE, CONTACT_PAGE ] );
	} );

	test( 'returns undefined selectedPageInstances when no pages are returned yet', () => {
		const result = selectWebsiteContent( {
			...baseResponse,
			selected_page_titles: [ HOME_PAGE, ABOUT_PAGE ],
			pages: [],
		} );
		expect( result.selectedPageInstances ).toBeUndefined();
	} );

	test( 'maps response fields to camelCase', () => {
		const result = selectWebsiteContent( {
			...baseResponse,
			selected_page_titles: [ HOME_PAGE ],
			pages: [
				{
					id: 'uuid-1',
					title: 'Home',
					content: 'home content',
					media: [],
					use_filler_content: true,
				},
			],
			site_logo_url: 'https://example.com/logo.png',
			generic_feedback: 'fb',
			search_terms: 'st',
		} );
		expect( result.pages[ 0 ] ).toEqual(
			expect.objectContaining( {
				id: 'uuid-1',
				title: 'Home',
				content: 'home content',
				useFillerContent: true,
			} )
		);
		expect( result.siteLogoUrl ).toBe( 'https://example.com/logo.png' );
		expect( result.genericFeedback ).toBe( 'fb' );
		expect( result.searchTerms ).toBe( 'st' );
	} );
} );
