/** @jest-environment jsdom */
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import themes from 'calypso/state/themes/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ProductPurchaseFeaturesList } from '../index';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui, themes } } );

jest.mock( '../video-audio-posts', () => ( props ) => (
	<div data-testid="video-audio-posts">{ JSON.stringify( props ) }</div>
) );
jest.mock( 'calypso/components/data/query-active-theme', () => () => 'QueryActiveTheme' );

describe( 'ProductPurchaseFeaturesList basic tests', () => {
	const props = {
		plan: PLAN_FREE,
		isPlaceholder: false,
		selectedSite: {
			plan: { product_slug: PLAN_FREE },
		},
	};

	test( 'should not blow up and have proper CSS class', () => {
		const { container } = render( <ProductPurchaseFeaturesList { ...props } /> );
		expect( container.firstChild ).toHaveClass( 'product-purchase-features-list' );
	} );
} );

describe( 'ProductPurchaseFeaturesList getFeatures() tests', () => {
	const props = {
		plan: PLAN_FREE,
		isPlaceholder: false,
		selectedSite: {
			plan: { product_slug: PLAN_FREE },
		},
	};

	let spy;
	let spyWrong;

	afterEach( () => {
		if ( spy ) {
			spy.mockClear();
		}
		if ( spyWrong ) {
			spyWrong.mockClear();
		}
	} );

	test( 'should not render features if is placeholder', () => {
		const { container } = render( <ProductPurchaseFeaturesList { ...props } isPlaceholder /> );
		expect( container.firstChild ).toBeEmptyDOMElement();
	} );

	test( 'should render no features for WP free plan', () => {
		const { container } = render( <ProductPurchaseFeaturesList { ...props } plan={ PLAN_FREE } /> );
		expect( container.firstChild ).toBeEmptyDOMElement();
	} );

	test( 'should render WP blogger features for WP blogger plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBloggerFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BLOGGER } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP blogger features for WP blogger plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBloggerFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BLOGGER_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP personal features for WP personal plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_PERSONAL } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP personal features for WP personal plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_PERSONAL_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP premium features for WP premium plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_PREMIUM } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP premium features for WP premium plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_PREMIUM_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP business features for WP business plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BUSINESS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP business features for WP business plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getPersonalFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_BUSINESS_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP ecommerce features for WP ecommerce plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getEcommerceFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_ECOMMERCE } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render WP ecommerce features for WP ecommerce plans - 2y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getEcommerceFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_ECOMMERCE_2_YEARS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack free features for jetpack free plans', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackFreeFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_FREE } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack personal features for jetpack personal plans - 1y', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PERSONAL } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack personal features for jetpack personal plans - monthly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PERSONAL_MONTHLY } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack premium features for jetpack premium plans - yearly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PREMIUM } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack premium features for jetpack premium plans - monthly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPremiumFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_PREMIUM_MONTHLY } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack business features for jetpack business plans - yearly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_BUSINESS } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );

	test( 'should render Jetpack business features for jetpack business plans - monthly', () => {
		spy = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackBusinessFeatures' );
		spyWrong = jest.spyOn( ProductPurchaseFeaturesList.prototype, 'getJetpackPersonalFeatures' );

		const { container } = render(
			<ProductPurchaseFeaturesList { ...props } plan={ PLAN_JETPACK_BUSINESS_MONTHLY } />
		);
		expect( spy ).toHaveBeenCalled();
		expect( spyWrong ).not.toHaveBeenCalled();
		expect( container.firstChild ).not.toBeEmptyDOMElement();
	} );
} );

describe( 'ProductPurchaseFeaturesList feature functions', () => {
	const props = {
		plan: PLAN_FREE,
		isPlaceholder: false,
		selectedSite: {
			plan: { product_slug: PLAN_FREE },
		},
	};

	test.each( [
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_2_YEARS,
		PLAN_PREMIUM,
	] )( `should pass proper plan type to VideoAudioPosts child component`, ( plan ) => {
		render( <ProductPurchaseFeaturesList { ...props } plan={ plan } /> );
		const audioPosts = screen.getByTestId( 'video-audio-posts' );
		expect( audioPosts ).toBeVisible();
		expect( JSON.parse( audioPosts.textContent ) ).toMatchObject( { plan } );
	} );
} );

describe( '<HappinessSupportCard isJetpackFreePlan', () => {
	const props = {
		plan: PLAN_JETPACK_FREE,
		selectedSite: {
			plan: { product_slug: PLAN_JETPACK_FREE },
		},
	};
	test( 'Should set isJetpackFreePlan for free plan', () => {
		render( <ProductPurchaseFeaturesList { ...props } /> );
		expect( screen.getByRole( 'heading', { name: /support documentation/i } ) ).toBeVisible();
	} );
} );

describe( '<HappinessSupportCard isEligibleForLiveChat', () => {
	test.each( [
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	] )( `Should be eligible for live chat for %s`, ( plan ) => {
		const props = {
			plan: plan,
			isPlaceholder: false,
			selectedSite: {
				plan: { product_slug: plan },
			},
		};
		render( <ProductPurchaseFeaturesList { ...props } /> );
		expect( screen.getByRole( 'link', { name: /ask a question/i } ) ).toBeVisible();
	} );
} );
