/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { TrackPurchasePageView } from '..';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'calypso/lib/user', () => () => {} );

const baseProps = deepFreeze( {
	eventName: 'calypso_testtracking_purchase_view',
	productSlug: 'my-fancy-product',
	recordTracksEvent: jest.fn(),

	// Not consumed by component, but required for connect to find slug
	purchaseId: 12345,
} );

beforeEach( jest.clearAllMocks );

describe( 'TrackPurchasePageView', () => {
	test( 'should render nothing', () => {
		const wrapper = shallow( <TrackPurchasePageView { ...baseProps } /> );
		expect( wrapper.type() ).toBeNull();
	} );

	test( 'should track on mount if data is loaded', () => {
		shallow( <TrackPurchasePageView { ...baseProps } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledWith( baseProps.eventName, {
			product_slug: baseProps.productSlug,
		} );
	} );

	test( 'should not track if productSlug is absent (data not loaded)', () => {
		shallow( <TrackPurchasePageView { ...baseProps } productSlug={ null } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 0 );
	} );

	test( 'should track when productSlug is provided (data loads)', () => {
		const wrapper = shallow( <TrackPurchasePageView { ...baseProps } productSlug={ null } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 0 );

		wrapper.setProps( { productSlug: baseProps.productSlug } );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledWith( baseProps.eventName, {
			product_slug: baseProps.productSlug,
		} );
	} );

	test( 'should only track once if relevant props are unchanged', () => {
		const wrapper = shallow( <TrackPurchasePageView { ...baseProps } /> );
		wrapper.update();
		wrapper.update();
		wrapper.update();
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should track when relevant props update', () => {
		const wrapper = shallow( <TrackPurchasePageView { ...baseProps } /> );

		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledWith( baseProps.eventName, {
			product_slug: baseProps.productSlug,
		} );

		const productSlug = 'new-product-slug';

		wrapper.setProps( { productSlug } );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( baseProps.recordTracksEvent ).toHaveBeenLastCalledWith( baseProps.eventName, {
			product_slug: productSlug,
		} );

		const eventName = 'new-tracking-slug';

		wrapper.setProps( { eventName } );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 3 );
		expect( baseProps.recordTracksEvent ).toHaveBeenLastCalledWith( eventName, {
			product_slug: productSlug,
		} );
	} );
} );
