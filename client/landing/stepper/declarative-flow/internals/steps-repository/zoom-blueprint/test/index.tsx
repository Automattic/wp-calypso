/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import React from 'react';
import ZoomBlueprintStep from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'ZoomBlueprintStep', () => {
	it( 'submits once on mount, with nothing to ask', async () => {
		const submit = jest.fn();

		const { rerender } = renderStep(
			<ZoomBlueprintStep { ...mockStepProps( { navigation: { submit } } ) } />,
			{ initialEntry: '/zoom?zoom_booking_url=https%3A%2F%2Fscheduler.zoom.us%2Fjane' }
		);

		await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );

		// A re-render with a new submit identity is the common case in the flow; it must not
		// submit the step twice.
		rerender( <ZoomBlueprintStep { ...mockStepProps( { navigation: { submit: jest.fn() } } ) } /> );
		expect( submit ).toHaveBeenCalledTimes( 1 );
	} );
} );
