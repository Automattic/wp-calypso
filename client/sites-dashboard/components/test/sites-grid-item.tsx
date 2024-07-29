/**
 * @jest-environment jsdom
 */
import React from 'react';
import renderer from 'react-test-renderer';
import { SitesGridItem } from 'calypso/sites-dashboard/components/sites-grid-item';
import { useCheckSiteTransferStatus } from '../../hooks/use-check-site-transfer-status';
import type { SiteExcerptData } from '@automattic/sites';

function makeTestSite( { title = 'test', is_coming_soon = false, lang = 'en' } = {} ) {
	return {
		ID: 1,
		title,
		slug: 'test_slug',
		URL: '',
		launch_status: 'launched',
		options: {},
		jetpack: false,
		is_coming_soon,
		lang,
	};
}

jest.mock( 'calypso/sites-dashboard/hooks/use-check-site-transfer-status.tsx', () => ( {
	__esModule: true,
	useCheckSiteTransferStatus: jest.fn(),
} ) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );

describe( '<SitesGridItem>', () => {
	beforeEach( () => {
		( useCheckSiteTransferStatus as jest.Mock ).mockReturnValue( {
			isTransferInProgress: false,
		} );
	} );
	test( 'Default render', () => {
		const tree = renderer
			.create(
				<SitesGridItem site={ makeTestSite( { title: 'The example site' } ) as SiteExcerptData } />
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'Custom render', () => {
		const tree = renderer
			.create(
				<SitesGridItem
					site={ makeTestSite( { title: 'The example site' } ) as SiteExcerptData }
					showLaunchNag={ false }
					showBadgeSection={ false }
					showThumbnailLink
					showSiteRenewLink={ false }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'Custom render 2', () => {
		const tree = renderer
			.create(
				<SitesGridItem
					site={ makeTestSite( { title: 'The example site' } ) as SiteExcerptData }
					showLaunchNag={ false }
					showBadgeSection={ false }
					showThumbnailLink={ false }
					showSiteRenewLink={ false }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
