/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useCheckoutFlowTrackKey from '../hooks/use-checkout-flow-track-key';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';

function renderTrackKey( sitelessCheckoutType: SitelessCheckoutType ) {
	return renderHook( () =>
		useCheckoutFlowTrackKey( {
			hasJetpackSiteSlug: false,
			sitelessCheckoutType,
			isJetpackNotAtomic: false,
		} )
	).result.current;
}

describe( 'useCheckoutFlowTrackKey', () => {
	// Sharing 'wpcom_checkout' would make the siteless funnel impossible to split in Tracks.
	it( 'gives WordPress.com siteless checkout its own flow key', () => {
		expect( renderTrackKey( 'wpcom' ) ).toBe( 'wpcom_siteless_checkout' );
	} );
} );
