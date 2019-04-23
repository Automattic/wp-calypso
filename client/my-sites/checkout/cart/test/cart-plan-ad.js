/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

jest.mock( 'page' );
jest.mock( 'lib/upgrades/actions' );

import { CartPlanAd } from '../cart-plan-ad';
import CartAd from '../cart-ad';

describe( 'cart-plan-ad', () => {
	const BLOGGER_PLAN = {
		expired: false,
		is_free: false,
		product_id: 1010,
		product_name_short: 'Blogger',
		product_slug: 'blogger-bundle',
		user_is_owner: true,
	};

	const FREE_PLAN = {
		expired: false,
		is_free: true,
		product_id: 1,
		product_name_short: 'Free',
		product_slug: 'free_plan',
		user_is_owner: false,
	};

	const PERSONAL_PLAN_CART_ITEM = {
		is_domain_registration: false,
		product_id: 1009,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
	};

	const DOMAIN_REGISTRATION_CART_ITEM = {
		is_domain_registration: true,
		product_id: 76,
		product_name: '.blog Domain Registration',
		product_slug: 'dotblog_domain',
	};

	const CART = {
		hasLoadedFromServer: true,
		hasPendingServerUpdates: false,
		products: [ DOMAIN_REGISTRATION_CART_ITEM ],
	};

	const props = {
		cart: CART,
		isDomainOnly: false,
		translate: str => str,
		selectedSite: {
			slug: 'example.com',
			plan: FREE_PLAN,
		},
	};

	test( 'Should be rendered when the cart has one domain registration only', () => {
		const wrapper = shallow( <CartPlanAd { ...props } /> );
		expect( wrapper.exists( CartAd ) ).toBe( true );
	} );

	test( 'Should not be rendered when no site is selected', () => {
		const wrapper = shallow( <CartPlanAd { ...props } selectedSite={ undefined } /> );
		expect( wrapper.type() ).toBe( null );
	} );

	test( 'Should not be rendered when the cart has any paid plan', () => {
		const wrapper = shallow(
			<CartPlanAd
				{ ...props }
				cart={ {
					...CART,
					products: [ PERSONAL_PLAN_CART_ITEM, DOMAIN_REGISTRATION_CART_ITEM ],
				} }
			/>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	test( 'Should not be rendered when the selected site is on any paid plan', () => {
		const wrapper = shallow(
			<CartPlanAd
				{ ...props }
				selectedSite={ {
					...props.selectedSite,
					plan: BLOGGER_PLAN,
				} }
			/>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	test( 'Should call recordTracksEvent() when the cta clicked', () => {
		const recordTracksEvent = jest.fn();
		const wrapper = shallow( <CartPlanAd { ...props } recordTracksEvent={ recordTracksEvent } /> );

		wrapper.find( 'Button' ).simulate( 'click' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_banner_cta_click', {
			cta_name: 'cart_domain_to_plan_upsell',
		} );
	} );
} );
