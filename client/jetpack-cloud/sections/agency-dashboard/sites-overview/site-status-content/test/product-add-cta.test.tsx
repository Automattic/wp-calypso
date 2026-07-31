/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { site } from '../../test/test-utils/constants';
import SiteBoostColumn from '../site-boost-column';
import SiteStatusColumn from '../site-status-column';
import type { RowMetaData, Site, SiteData } from '../../types';
import type { ReactNode } from 'react';

jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies' );

const mockIsA8CForAgencies = jest.mocked( isA8CForAgencies );

const store = configureStore()( {
	partnerPortal: { partner: { current: { can_issue_licenses: true } } },
	sites: { items: {} },
} );

const Wrapper = ( { children }: { children: ReactNode } ) => (
	<Provider store={ store }>
		<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
	</Provider>
);

const inactiveBackupMetadata: RowMetaData = {
	row: { value: '', status: 'inactive' },
	link: '',
	isExternalLink: false,
	tooltipId: `${ site.blog_id }-backup`,
	siteDown: false,
	eventName: undefined,
	isSupported: true,
};

const rows = { site: { value: site } } as SiteData;

const siteWithoutBoost: Site = {
	...site,
	has_boost: false,
	jetpack_boost_scores: { overall: 0, mobile: 0, desktop: 0 },
};

const renderBackupColumn = () =>
	render( <SiteStatusColumn type="backup" rows={ rows } metadata={ inactiveBackupMetadata } />, {
		wrapper: Wrapper,
	} );

const renderBoostColumn = () =>
	render( <SiteBoostColumn site={ siteWithoutBoost } />, { wrapper: Wrapper } );

describe( 'sites dashboard columns for a site without the product', () => {
	describe( 'on A4A', () => {
		beforeEach( () => mockIsA8CForAgencies.mockReturnValue( true ) );

		it( 'renders an empty state instead of the backup "Add" CTA', () => {
			const { container } = renderBackupColumn();

			expect( screen.queryByRole( 'button', { name: 'Add' } ) ).toBeNull();
			expect( container.querySelector( '.sites-overview__icon-active' ) ).toBeVisible();
		} );

		it( 'renders an empty state instead of the boost "Add" CTA', () => {
			const { container } = renderBoostColumn();

			expect( screen.queryByRole( 'button', { name: 'Add' } ) ).toBeNull();
			expect( container.querySelector( '.sites-overview__icon-active' ) ).toBeVisible();
		} );
	} );

	describe( 'on Jetpack Cloud', () => {
		beforeEach( () => mockIsA8CForAgencies.mockReturnValue( false ) );

		it( 'keeps the backup "Add" CTA', () => {
			renderBackupColumn();

			expect( screen.getByRole( 'button', { name: 'Add' } ) ).toBeVisible();
		} );

		it( 'keeps the boost "Add" CTA', () => {
			renderBoostColumn();

			expect( screen.getByRole( 'button', { name: 'Add' } ) ).toBeVisible();
		} );
	} );
} );
