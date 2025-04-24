/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
import { WPCOM_FEATURES_PREMIUM_THEMES_LIMITED } from '@automattic/calypso-products';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import wpcomProxyRequest from 'wpcom-proxy-request';
import ThemeTierBadge from '../index';
import { PERSONAL_PLAN } from './helpers/fixtures';
import { render } from './helpers/utils';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );

describe( 'ThemeTierBadge', () => {
	it( 'should render the free badge when seeing a free theme', () => {
		render(
			<ThemeTierBadge
				themeId="twentysixteen"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation={ false }
			/>
		);

		expect( screen.getByText( 'Free' ) ).toBeInTheDocument();
	} );

	it( 'should render the included with plan badge if site has the corresponding feature', () => {
		render(
			<ThemeTierBadge
				themeId="bute"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation={ false }
			/>,
			{
				siteFeatures: [ WPCOM_FEATURES_PREMIUM_THEMES_LIMITED ],
			}
		);

		expect( screen.getByText( 'Included with plan' ) ).toBeInTheDocument();
	} );

	it( 'should render the community badge for dot org themes', () => {
		render(
			<ThemeTierBadge
				themeId="twentytwentyfive"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation={ false }
			/>,
			{
				themeRepository: 'wporg',
			}
		);

		expect( screen.getByText( 'Community' ) ).toBeInTheDocument();
	} );

	it( 'should render bundled badge for bundled themes', () => {
		render(
			<ThemeTierBadge
				themeId="kiosko"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation={ false }
			/>
		);
		expect( screen.getByText( 'WooCommerce' ) ).toBeInTheDocument();
	} );

	it( 'should render the upgrade badge when isLockedStyleVariation is true', () => {
		render(
			<ThemeTierBadge
				themeId="twentytwentyfive"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation
			/>,
			{
				themeRepository: 'wporg',
			}
		);

		expect( screen.getByText( 'Upgrade' ) ).toBeInTheDocument();
	} );

	it( 'should render partner badge for partner or marketplace themes', () => {
		render(
			<ThemeTierBadge
				themeId="drinkify"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation={ false }
			/>
		);
		expect( screen.getByText( 'Partner' ) ).toBeInTheDocument();
	} );

	it( 'should render upgrade badge for non-allowed themes', async () => {
		jest.mocked( wpcomProxyRequest ).mockResolvedValue( [ PERSONAL_PLAN ] );

		render(
			<ThemeTierBadge
				themeId="nion"
				siteId={ 123 }
				siteSlug="test-site"
				isLockedStyleVariation={ false }
			/>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Available on Personal' ) ).toBeInTheDocument();
		} );
	} );
} );
