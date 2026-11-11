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
		config.isEnabled.mockImplementation( () => false );
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

	test( 'should render the rating without a review link if marketplace product', () => {
		const props = {
			...mockedProps,
			isMarketplaceProduct: true,
			plugin: { ...mockedProps.plugin, num_ratings: undefined, rating: 90 },
		};
		const { container } = render( <PluginDetailsHeader { ...props } /> );
		const ratingElement = container.querySelector( '.plugin-details-header__info-value' );
		expect( ratingElement ).toHaveTextContent( '4.5/5' );
		expect( screen.queryByText( 'Add a review' ) ).not.toBeInTheDocument();
	} );

	test.each( [ { rating: NaN }, { rating: 0 }, { rating: undefined } ] )(
		'should not render ratings if marketplace product without a rating (rating: $rating)',
		( { rating } ) => {
			const props = {
				...mockedProps,
				isMarketplaceProduct: true,
				plugin: { ...mockedProps.plugin, num_ratings: undefined, rating },
			};
			render( <PluginDetailsHeader { ...props } /> );
			expect( screen.queryByText( /^Ratings?$/ ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Add a review' ) ).not.toBeInTheDocument();
		}
	);

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

	test( 'should show plugin.version for marketplace products, not installed versions', () => {
		const props = {
			...mockedProps,
			isMarketplaceProduct: true,
			plugin: { ...mockedProps.plugin, version: '6.2.0' },
		};
		render( <PluginDetailsHeader { ...props } /> );
		expect( screen.getByText( '6.2.0' ) ).toBeInTheDocument();
	} );

	test( 'should show installed versions range for non-marketplace products', () => {
		const props = {
			...mockedProps,
			isMarketplaceProduct: false,
			plugin: { ...mockedProps.plugin, version: '6.2.0' },
		};
		render( <PluginDetailsHeader { ...props } /> );
		expect( screen.getByText( '1.0.0' ) ).toBeInTheDocument();
	} );
} );
