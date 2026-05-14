/**
 * @jest-environment jsdom
 */
import { WPCOM_FEATURES_SUBSCRIPTION_GIFTING } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SubscriptionGiftingForm from '../subscription-gifting';

const SITE_ID = 1;

const mockStore = configureStore();

function buildState( { hasFeature = true, isStaging = false, unsafe = false } = {} ) {
	return {
		ui: {
			selectedSiteId: SITE_ID,
		},
		sites: {
			items: {
				[ SITE_ID ]: {
					ID: SITE_ID,
					is_wpcom_staging_site: isStaging,
				},
			},
			features: {
				[ SITE_ID ]: {
					data: {
						active: hasFeature ? [ WPCOM_FEATURES_SUBSCRIPTION_GIFTING ] : [],
					},
				},
			},
		},
		wordads: {
			status: {
				[ SITE_ID ]: {
					unsafe,
				},
			},
		},
	};
}

const defaultProps = {
	fields: { wpcom_gifting_subscription: false },
	handleAutosavingToggle: () => () => {},
	disabled: false,
};

function renderWithStore( state ) {
	const store = mockStore( state );
	return render(
		<Provider store={ store }>
			<SubscriptionGiftingForm { ...defaultProps } />
		</Provider>
	);
}

describe( '<SubscriptionGiftingForm>', () => {
	test( 'renders gifting panel when feature is available and site is safe', () => {
		renderWithStore( buildState() );
		expect( screen.getByText( 'Accept a gift subscription' ) ).toBeVisible();
	} );

	test( 'does not render when the subscription gifting feature is unavailable', () => {
		renderWithStore( buildState( { hasFeature: false } ) );
		expect( screen.queryByText( 'Accept a gift subscription' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render on a staging site', () => {
		renderWithStore( buildState( { isStaging: true } ) );
		expect( screen.queryByText( 'Accept a gift subscription' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render on a mature/brown-flagged site', () => {
		renderWithStore( buildState( { unsafe: 'mature' } ) );
		expect( screen.queryByText( 'Accept a gift subscription' ) ).not.toBeInTheDocument();
	} );

	test( 'renders on a site with a non-mature unsafe status', () => {
		renderWithStore( buildState( { unsafe: 'spam' } ) );
		expect( screen.getByText( 'Accept a gift subscription' ) ).toBeVisible();
	} );
} );
