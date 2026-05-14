/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { isSiteWordadsUnsafe } from 'calypso/state/wordads/status/selectors';
import SubscriptionGiftingForm from '../subscription-gifting';

jest.mock( 'calypso/state/sites/hooks', () => ( {
	useSelectedSiteSelector: jest.fn(),
} ) );

jest.mock( 'calypso/components/inline-support-link', () => () => null );
jest.mock( 'calypso/components/panel', () => ( {
	PanelCard: ( { children } ) => <div>{ children }</div>,
	PanelCardDescription: ( { children } ) => <div>{ children }</div>,
	PanelCardHeading: ( { children } ) => <div>{ children }</div>,
} ) );

const defaultProps = {
	fields: { wpcom_gifting_subscription: false },
	handleAutosavingToggle: jest.fn( () => jest.fn() ),
	disabled: false,
};

function setupSelectorMocks( { hasFeature = true, isStaging = false, wordadsUnsafe = false } = {} ) {
	useSelectedSiteSelector.mockImplementation( ( selector ) => {
		if ( selector === siteHasFeature ) {
			return hasFeature;
		}
		if ( selector === isSiteWpcomStaging ) {
			return isStaging;
		}
		if ( selector === isSiteWordadsUnsafe ) {
			return wordadsUnsafe;
		}
		return false;
	} );
}

describe( 'SubscriptionGiftingForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders when site has feature, is not staging, and is not mature', () => {
		setupSelectorMocks();
		render( <SubscriptionGiftingForm { ...defaultProps } /> );
		expect( screen.getByText( 'Accept a gift subscription' ) ).toBeVisible();
	} );

	it( 'does not render when site does not have gifting feature', () => {
		setupSelectorMocks( { hasFeature: false } );
		const { container } = render( <SubscriptionGiftingForm { ...defaultProps } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'does not render on wpcom staging sites', () => {
		setupSelectorMocks( { isStaging: true } );
		const { container } = render( <SubscriptionGiftingForm { ...defaultProps } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'does not render on mature/brown-flagged sites', () => {
		setupSelectorMocks( { wordadsUnsafe: 'mature' } );
		const { container } = render( <SubscriptionGiftingForm { ...defaultProps } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders when wordads unsafe status is not mature', () => {
		setupSelectorMocks( { wordadsUnsafe: 'private' } );
		render( <SubscriptionGiftingForm { ...defaultProps } /> );
		expect( screen.getByText( 'Accept a gift subscription' ) ).toBeVisible();
	} );
} );
