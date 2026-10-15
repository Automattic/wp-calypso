/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DownloadBadges, { getBadgeDownloads } from '../download-badges';

describe( 'getBadgeDownloads', () => {
	test( 'returns one badge per directory for the agency tier', () => {
		expect( getBadgeDownloads( [ 'wordpress', 'jetpack' ], 'agency-partner' ) ).toEqual( [
			expect.objectContaining( { product: 'wordpress', name: 'WordPress.com Agency Partner' } ),
			expect.objectContaining( { product: 'jetpack', name: 'Jetpack Agency Partner' } ),
		] );
	} );

	test( 'adds the VIP badge for the VIP Pro and Premier tiers', () => {
		expect( getBadgeDownloads( [], 'vip-pro-agency-partner' ) ).toEqual( [
			expect.objectContaining( { product: 'vip', name: 'WordPress VIP Pro Agency Partner' } ),
		] );
		expect( getBadgeDownloads( [ 'woocommerce' ], 'premier-partner' ) ).toEqual( [
			expect.objectContaining( { product: 'woocommerce', name: 'Woo Premier Agency Partner' } ),
			expect.objectContaining( { product: 'vip', name: 'WordPress VIP Premier Agency Partner' } ),
		] );
	} );

	test( 'returns nothing without a tier or when no badge exists for the tier', () => {
		expect( getBadgeDownloads( [ 'wordpress' ] ) ).toEqual( [] );
		expect( getBadgeDownloads( [ 'wordpress' ], 'emerging-partner' ) ).toEqual( [] );
		expect( getBadgeDownloads( [], 'pro-agency-partner' ) ).toEqual( [] );
	} );
} );

describe( '<DownloadBadges>', () => {
	test( 'renders nothing when the agency has no badges to download', () => {
		const { container } = render(
			<DownloadBadges directories={ [] } currentAgencyTierId="agency-partner" />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'opens a modal listing the badge downloads and records the Tracks events', async () => {
		const recordTracksEvent = jest.fn();
		render(
			<DownloadBadges
				directories={ [ 'pressable' ] }
				currentAgencyTierId="pro-agency-partner"
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Download your badges' } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_agency_tier_badges_download_modal_open'
		);

		const dialog = screen.getByRole( 'dialog', { name: 'Download your badges' } );
		const link = screen.getByRole( 'link', {
			name: 'Download Pressable Pro Agency Partner badges',
		} );
		expect( dialog ).toContainElement( link );
		expect( link ).toHaveAttribute(
			'href',
			'https://automattic.com/wp-content/uploads/2024/10/agency_tier_pressable_pro_partner.zip'
		);
		expect( link ).not.toHaveAttribute( 'target' );

		await userEvent.click( link );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_agency_tier_badges_download_modal_download_click',
			{ product: 'pressable', agency_tier: 'pro-agency-partner' }
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitForElementToBeRemoved( dialog );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_agency_tier_badges_download_modal_close'
		);
	} );

	test( 'names the VIP badge so it stands apart from the WordPress.com one', async () => {
		render(
			<DownloadBadges directories={ [ 'wordpress' ] } currentAgencyTierId="premier-partner" />
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Download your badges' } ) );

		expect(
			screen.getByRole( 'link', { name: 'Download WordPress VIP Premier Agency Partner badges' } )
		).toBeVisible();
		expect(
			screen.getByRole( 'link', { name: 'Download WordPress.com Premier Agency Partner badges' } )
		).toBeVisible();
		expect( screen.getByText( 'WordPress VIP Premier Agency Partner' ) ).toBeVisible();
	} );
} );
