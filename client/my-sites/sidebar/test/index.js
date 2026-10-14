import { isItemSelected, itemLinkMatches } from '../utils';

describe( 'MySitesSidebar', () => {
	describe( '#itemLinkMatches()', () => {
		test( "should return false if a path's first fragment doesn't match the current path", () => {
			const isSelected = itemLinkMatches(
				'/pages/example.wordpress.com',
				'/posts/example.wordpress.com'
			);

			expect( isSelected ).toBe( false );
		} );

		test( "should return true if a path's first fragment does match the current path", () => {
			const isSelected = itemLinkMatches(
				'/pages/example.wordpress.com',
				'/pages/test/example.wordpress.com'
			);

			expect( isSelected ).toBe( true );
		} );

		test( 'should return true for jetpack types', () => {
			const isSelected = itemLinkMatches(
				'/types/jetpack-testimonial',
				'/types/jetpack-testimonial/test'
			);

			expect( isSelected ).toBe( true );
		} );

		test( 'should return true if one of the paths is a prefix of the current path and separated by search query', () => {
			const isSelected = itemLinkMatches( '/posts', '/posts?s=search' );

			expect( isSelected ).toBe( true );
		} );

		test( 'should return false if a fragment matches but not in position (1)', () => {
			const isSelected = itemLinkMatches(
				'/pages/example.wordpress.com',
				'/test/pages/example.wordpress.com'
			);

			expect( isSelected ).toBe( false );
		} );
		test( '#itemLinkMatches() compares 2 part path with 1 part path without error', () => {
			const isSelected = itemLinkMatches( '/stats/day', '/plugins' );

			expect( isSelected ).toBe( false );
		} );
	} );

	describe( '#itemLinkMatches() edge cases', () => {
		test.each( [ '/site-redesign/example.wordpress.com', '/site-redesign/123?redesign=rd_1' ] )(
			'selects the native Themes item for redesign subpage %s',
			( currentPath ) => {
				expect( itemLinkMatches( '/themes/example.wordpress.com', currentPath ) ).toBe( true );
				expect( itemLinkMatches( '/customize/example.wordpress.com', currentPath ) ).toBe( false );
				expect( itemLinkMatches( '/posts/example.wordpress.com', currentPath ) ).toBe( false );
			}
		);

		test( 'does not retain Themes selection after leaving redesign or match similarly named routes', () => {
			expect(
				itemLinkMatches( '/themes/example.wordpress.com', '/pages/example.wordpress.com' )
			).toBe( false );
			expect(
				itemLinkMatches(
					'/themes/example.wordpress.com',
					'/site-redesign-other/example.wordpress.com'
				)
			).toBe( false );
			expect(
				itemLinkMatches( '/themes/example.wordpress.com', '/themes/example.wordpress.com' )
			).toBe( true );
		} );

		test( 'clicking a settings panel should not activate the posts menu', () => {
			const isSelected = itemLinkMatches(
				'/settings/general/example.wordpress.com',
				'/settings/discussion/cpapfree.wordpress.com'
			);

			expect( isSelected ).toBe( false );
		} );

		test( 'clicking a marketing panel should activate the marketing menu', () => {
			const isSelected = itemLinkMatches(
				'/marketing/sharing-buttons/example.wordpress.com',
				'/marketing/connections/cpapfree.wordpress.com'
			);

			expect( isSelected ).toBe( true );
		} );
	} );

	describe( '#isItemSelected()', () => {
		const site = { ID: 1234 };

		describe( 'Sites', () => {
			const menuItem = { url: '/sites', slug: 'sites' };
			const path = '/overview/test.wordpress.com';

			test( 'should return false when `site` is not set', () => {
				const isSelected = isItemSelected( menuItem, path, null );

				expect( isSelected ).toBe( false );
			} );

			test( 'should not highlight Sites menu when viewing a domain', () => {
				const isSelected = isItemSelected( menuItem, '/domains/manage', site );

				expect( isSelected ).toBe( false );
			} );

			test( 'should not highlight Sites menu when the site is a P2', () => {
				const isSelected = isItemSelected( menuItem, path, site, true );

				expect( isSelected ).toBe( false );
			} );

			test( 'should highlight Sites menu when the site is not a P2', () => {
				const isSelected = isItemSelected( menuItem, path, site, false );

				expect( isSelected ).toBe( true );
			} );
		} );

		describe( 'P2s', () => {
			const menuItem = { url: '/p2s', slug: 'sites-p2' };
			const path = '/hosting-features/test.wordpress.com/test.wordpress.com';

			test( 'should not highlight P2s menu when viewing a domain', () => {
				const isSelected = isItemSelected( menuItem, '/domains/manage', site );

				expect( isSelected ).toBe( false );
			} );

			test( 'should not highlight P2s menu when the site is not a P2', () => {
				const isSelected = isItemSelected( menuItem, path, site, false );

				expect( isSelected ).toBe( false );
			} );

			test( 'should highlight P2s menu when the site is a P2', () => {
				const isSelected = isItemSelected( menuItem, path, site, true );

				expect( isSelected ).toBe( true );
			} );
		} );

		describe( 'Domains', () => {
			const menuItem = { url: '/domains/manage', slug: 'domains' };
			const path = '/domains/manage/all/overview/test.wordpress.com/test.wordpress.com';

			test( 'should highlight Domains menu when viewing a domain', () => {
				const isSelected = isItemSelected( menuItem, path, site );

				expect( isSelected ).toBe( true );
			} );
		} );
	} );
} );
