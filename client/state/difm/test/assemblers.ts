import { buildDIFMCartExtrasObject } from '../assemblers';

describe( 'assembler', () => {
	test( 'should convert dependencies and difm state to the extras object when difm state is empty', () => {
		const dependencies = {
			newOrExistingSiteChoice: false,
			siteTitle: 'test title',
			siteDescription: 'test tagline',
			selectedDesign: { theme: 'test theme' },
			selectedSiteCategory: 'test category',
			isLetUsChooseSelected: false,
			twitterUrl: 'test twitterUrl',
			facebookUrl: 'test facebookUrl',
			linkedinUrl: 'test linkedinUrl',
			instagramUrl: 'test instagramUrl',
			displayEmail: 'test displayEmail',
			displayPhone: 'test displayPhone',
			displayAddress: 'test displayAddress',
			selectedPageTitles: [ 'test1', 'test2' ],
		};
		const siteId = 100;
		expect( buildDIFMCartExtrasObject( dependencies, siteId, 'test-context' ) ).toEqual( {
			twitter_url: 'test twitterUrl',
			facebook_url: 'test facebookUrl',
			linkedin_url: 'test linkedinUrl',
			instagram_url: 'test instagramUrl',
			display_email: 'test displayEmail',
			display_phone: 'test displayPhone',
			display_address: 'test displayAddress',
			let_us_choose_selected: false,
			new_or_existing_site_choice: false,
			selected_design: 'test theme',
			site_category: 'test category',
			site_description: 'test tagline',
			site_title: 'test title',
			selected_page_titles: [ 'test1', 'test2' ],
			afterPurchaseUrl: '/start/site-content-collection?siteId=100',
			is_store_flow: undefined,
			search_terms: undefined,
		} );
	} );
} );
