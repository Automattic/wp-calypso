/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );

jest.mock( '../../plugin-management-v2/hooks/use-plugin-version-info', () => {
	return jest.fn().mockImplementation( () => {
		return {
			currentVersionsRange: {
				min: '1.0.0',
				max: null,
			},
			updatedVersions: [ '1.0.0' ],
			hasUpdate: true,
		};
	} );
} );

const mockUseMarketplaceReviewsQuery = jest.fn();
const mockUseMarketplaceReviewsStatsQuery = jest.fn().mockReturnValue( { data: [] } );

jest.mock( 'calypso/data/marketplace/use-marketplace-reviews', () => ( {
	useMarketplaceReviewsQuery: () => mockUseMarketplaceReviewsQuery(),
	useMarketplaceReviewsStatsQuery: () => mockUseMarketplaceReviewsStatsQuery(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const fn = ( key ) => {
		if ( 'magnificent_non_en_locales' === key ) {
			return [
				'es',
				'pt-br',
				'de',
				'fr',
				'he',
				'ja',
				'it',
				'nl',
				'ru',
				'tr',
				'id',
				'zh-cn',
				'zh-tw',
				'ko',
				'ar',
				'sv',
			];
		}
	};
	fn.isEnabled = jest.fn();
	return fn;
} );

const plugin = {
	name: 'Yoast SEO Premium',
	slug: 'wordpress-seo-premium',
	author_name: 'Team Yoast',
	author_profile: 'https://profiles.wordpress.org/yoast/',
	num_ratings: 0,
	last_updated: '2021-01-01',
};

describe( 'PluginDetailsHeader', () => {
	const mockedProps = {
		isJetpackCloud: false,
		isPlaceholder: false,
		plugin,
	};

	beforeEach( () => {
		mockUseMarketplaceReviewsQuery.mockReturnValue( {
			data: [
				{
					id: 0,
					meta: {
						wpcom_marketplace_rating: 1,
					},
				},
			],
		} );
	} );

	test.each( [ { configEnabled: true }, { configEnabled: false } ] )(
		'should render the correct author url (configEnabled: $configEnabled)',
		( { configEnabled } ) => {
			config.isEnabled.mockImplementation( () => configEnabled );
			render( <PluginDetailsHeader { ...mockedProps } /> );
			const want = /\/plugins\/.*\?s=developer:.*/;
			const have = screen.getByText( plugin.author_name ).getAttribute( 'href' );
			expect( have ).toMatch( want );
		}
	);

	test( 'should render ratings if they are available', () => {
		const props = {
			...mockedProps,
			plugin: {
				...mockedProps.plugin,
				num_ratings: 1,
				rating: 23,
			},
		};

		const { container } = render( <PluginDetailsHeader { ...props } /> );
		const ratingElement = container.querySelector( '.plugin-details-header__info-value' );
		expect( ratingElement ).toHaveTextContent( '1.2/5' );
	} );

	test( 'should render "add a review" if marketplace product with no ratings', () => {
		mockUseMarketplaceReviewsQuery.mockReturnValue( { data: [] } );
		const props = {
			...mockedProps,
			isMarketplaceProduct: true,
			plugin: { ...mockedProps.plugin, num_ratings: 0, rating: 0 },
		};
		render( <PluginDetailsHeader { ...props } /> );
		const button = screen.getByText( 'Add a review' );
		expect( button.tagName.toLowerCase() ).toBe( 'button' );
	} );

	test( 'should render review count if marketplace product', () => {
		const props = {
			...mockedProps,
			isMarketplaceProduct: true,
			plugin: { ...mockedProps.plugin, num_ratings: 0, rating: 0 },
		};
		render( <PluginDetailsHeader { ...props } /> );
		const button = screen.getByText( '1 review' );
		expect( button.tagName.toLowerCase() ).toBe( 'button' );
	} );

	test( 'should render "add a review" if dotOrg plugin with no ratings', () => {
		const props = {
			...mockedProps,
			plugin: { ...mockedProps.plugin, num_ratings: 0, rating: 0 },
		};
		render( <PluginDetailsHeader { ...props } /> );
		const link = screen.getByText( 'Add a review' );
		expect( link.tagName.toLowerCase() ).toBe( 'a' );
		expect( link ).toHaveAttribute(
			'href',
			`https://wordpress.org/support/plugin/${ props.plugin.slug }/reviews`
		);
	} );
} );
