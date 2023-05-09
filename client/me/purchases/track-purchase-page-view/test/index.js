/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
import { TrackPurchasePageView } from '..';

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
		const { container } = render( <TrackPurchasePageView { ...baseProps } /> );
		expect( container.innerHTML ).toEqual( '' );
	} );

	test( 'should track on mount if data is loaded', () => {
		render( <TrackPurchasePageView { ...baseProps } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledWith( baseProps.eventName, {
			product_slug: baseProps.productSlug,
		} );
	} );

	test( 'should not track if productSlug is absent (data not loaded)', () => {
		render( <TrackPurchasePageView { ...baseProps } productSlug={ null } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 0 );
	} );

	test( 'should track when productSlug is provided (data loads)', () => {
		const { rerender } = render( <TrackPurchasePageView { ...baseProps } productSlug={ null } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 0 );

		rerender( <TrackPurchasePageView { ...baseProps } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledWith( baseProps.eventName, {
			product_slug: baseProps.productSlug,
		} );
	} );

	test( 'should only track once if relevant props are unchanged', () => {
		const { rerender } = render( <TrackPurchasePageView { ...baseProps } /> );
		rerender( <TrackPurchasePageView { ...baseProps } /> );
		rerender( <TrackPurchasePageView { ...baseProps } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should track when relevant props update', () => {
		const { rerender } = render( <TrackPurchasePageView { ...baseProps } /> );

		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledWith( baseProps.eventName, {
			product_slug: baseProps.productSlug,
		} );

		const productSlug = 'new-product-slug';

		rerender( <TrackPurchasePageView { ...baseProps } productSlug={ productSlug } /> );
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( baseProps.recordTracksEvent ).toHaveBeenLastCalledWith( baseProps.eventName, {
			product_slug: productSlug,
		} );

		const eventName = 'new-tracking-slug';

		rerender(
			<TrackPurchasePageView { ...baseProps } productSlug={ productSlug } eventName={ eventName } />
		);
		expect( baseProps.recordTracksEvent ).toHaveBeenCalledTimes( 3 );
		expect( baseProps.recordTracksEvent ).toHaveBeenLastCalledWith( eventName, {
			product_slug: productSlug,
		} );
	} );
} );
