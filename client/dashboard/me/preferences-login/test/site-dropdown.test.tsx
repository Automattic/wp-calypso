/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import PreferencesLoginSiteDropdown from '../site-dropdown';
import type { Site } from '@automattic/api-core';

jest.mock( '@wordpress/components', () => ( {
	ComboboxControl: ( {
		__experimentalRenderItem,
		options,
	}: {
		__experimentalRenderItem: ( {
			item,
		}: {
			item: { value: string; label: string };
		} ) => React.ReactElement | null;
		options: unknown[];
	} ) => {
		// Render the first option to test the SiteIcon logic
		if ( options.length > 0 && __experimentalRenderItem ) {
			const firstOption = options[ 0 ] as { value: string; label: string };
			return __experimentalRenderItem( { item: firstOption } );
		}
		return <div data-testid="combobox-control" />;
	},
	Icon: ( { icon }: { icon: string } ) => <div data-testid={ `icon-${ icon }` } />,
	__experimentalVStack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	__experimentalHStack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	__experimentalText: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( '@wordpress/icons', () => ( {
	check: 'check',
	globe: 'globe',
} ) );

jest.mock( '../../../utils/site-name', () => ( {
	getSiteDisplayName: ( site: Site ) => site.name,
} ) );

jest.mock( '../../../utils/site-url', () => ( {
	getSiteDisplayUrl: ( site: Site ) => site.URL.replace( /^https?:\/\//, '' ),
} ) );

function createMockSite( overrides: Partial< Site > = {} ): Site {
	return {
		ID: 1,
		slug: 'test-site',
		name: 'Test Site',
		URL: 'https://test.com',
		capabilities: { manage_options: true, update_plugins: false },
		is_a4a_dev_site: false,
		is_a8c: false,
		is_deleted: false,
		is_coming_soon: false,
		is_private: false,
		is_wpcom_atomic: false,
		is_wpcom_flex: false,
		is_wpcom_staging_site: false,
		is_vip: false,
		lang: 'en',
		launch_status: 'launched',
		site_migration: {
			in_progress: false,
			is_complete: false,
		},
		site_owner: 1,
		jetpack: false,
		jetpack_connection: false,
		jetpack_modules: null,
		was_ecommerce_trial: false,
		was_migration_trial: false,
		was_hosting_trial: false,
		was_upgraded_from_trial: false,
		...overrides,
	};
}

describe( 'PreferencesLoginSiteDropdown - Business Logic', () => {
	describe( 'Site icon rendering logic', () => {
		test( 'renders image when site has valid icon', () => {
			const siteWithIcon = createMockSite( {
				icon: { ico: 'https://example.com/icon.png' },
			} );

			const { container } = render(
				<PreferencesLoginSiteDropdown sites={ [ siteWithIcon ] } onChange={ jest.fn() } />
			);

			const img = container.querySelector( 'img' );
			expect( img ).toBeInTheDocument();
		} );

		test( 'renders fallback globe icon when site has no icon', () => {
			const siteWithoutIcon = createMockSite( {
				icon: undefined,
			} );

			const { getByTestId } = render(
				<PreferencesLoginSiteDropdown sites={ [ siteWithoutIcon ] } onChange={ jest.fn() } />
			);

			expect( getByTestId( 'icon-globe' ) ).toBeInTheDocument();
		} );

		test( 'renders fallback globe icon when site icon ico is missing', () => {
			const siteWithEmptyIcon = createMockSite( {
				icon: { ico: '' },
			} );

			const { getByTestId } = render(
				<PreferencesLoginSiteDropdown sites={ [ siteWithEmptyIcon ] } onChange={ jest.fn() } />
			);

			expect( getByTestId( 'icon-globe' ) ).toBeInTheDocument();
		} );
	} );
} );
