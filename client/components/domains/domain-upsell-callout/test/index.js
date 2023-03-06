/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DomainUpsellCallout from '../index';

// Test that the DomainUpsellCallout component renders null when isP2Site is true
const mockProps = {
	TrackEvent: '',
};

describe( 'domain-upsell-callout', () => {
	test( 'should render null when isP2Site is true', () => {
		const testProps = {
			...mockProps,
			isP2Site: true,
		};

		renderWithProvider( <DomainUpsellCallout { ...testProps } /> );

		expect( screen.getByText( 'Customize your domain' ) ).not.toBeVisible();
	} );
} );
