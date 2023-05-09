/**
 * @jest-environment jsdom
 */
import {
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from '@automattic/calypso-products';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { UpsellNudge } from '../index';

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		reducers: {
			ui: uiReducer,
		},
	} );
}

describe( 'UpsellNudge should render a Banner with a class name corresponding to appropriate plan', () => {
	const props = {
		callToAction: null,
		title: 'banner title',
		forceDisplay: true,
	};

	[
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Personal', () => {
			const { container } = renderWithRedux( <UpsellNudge { ...props } plan={ plan } /> );
			expect( container.firstChild ).toHaveClass( 'is-upgrade-personal' );
		} );
	} );

	[
		PLAN_PREMIUM,
		PLAN_PREMIUM_2_YEARS,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Premium', () => {
			const { container } = renderWithRedux( <UpsellNudge { ...props } plan={ plan } /> );
			expect( container.firstChild ).toHaveClass( 'is-upgrade-premium' );
		} );
	} );

	[
		PLAN_BUSINESS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		test( 'Business', () => {
			const { container } = renderWithRedux( <UpsellNudge { ...props } plan={ plan } /> );
			expect( container.firstChild ).toHaveClass( 'is-upgrade-business' );
		} );
	} );
} );
