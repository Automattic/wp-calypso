/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import ContactDetailsSummary from '../summary';
import type { Domain } from '@automattic/api-core';

// Mock the RouterLinkSummaryButton component to test navigation
const mockNavigateTo = jest.fn();

jest.mock( '../../../components/router-link-summary-button', () => {
	return function MockRouterLinkSummaryButton( props: any ) {
		return (
			<button
				data-testid="router-link-summary-button"
				data-to={ props.to }
				data-title={ props.title }
				data-badges={ JSON.stringify( props.badges ) }
				data-disabled={ props.disabled ?? false }
				onClick={ () => {
					// Simulate navigation by calling the mock function
					mockNavigateTo( props.to );
				} }
			>
				{ props.title }
				{ props.badges?.map( ( badge: any, index: number ) => (
					<span key={ index } data-testid={ `badge-${ index }` }>
						{ badge.text }
					</span>
				) ) }
			</button>
		);
	};
} );

// Helper function to create a mock domain
function createMockDomain( overrides: Partial< Domain > = {} ): Domain {
	return {
		domain: 'example.com',
		privacy_available: true,
		private_domain: false,
		...overrides,
	} as Domain;
}

describe( 'ContactDetailsSummary', () => {
	beforeEach( () => {
		// Clear mock calls before each test
		mockNavigateTo.mockClear();
	} );

	describe( 'privacy status display logic', () => {
		test( 'displays "Privacy protection on" badge when privacy is available and enabled', () => {
			const domain = createMockDomain( {
				privacy_available: true,
				private_domain: true,
			} );

			render( <ContactDetailsSummary domain={ domain } /> );

			const badge = screen.getByTestId( 'badge-0' );
			expect( badge ).toHaveTextContent( 'Privacy protection on' );

			// Check that the badge data includes success intent
			const button = screen.getByTestId( 'router-link-summary-button' );
			const badgesData = JSON.parse( button.getAttribute( 'data-badges' ) || '[]' );
			expect( badgesData[ 0 ] ).toEqual( {
				text: 'Privacy protection on',
				intent: 'success',
			} );
		} );

		test( 'displays "Privacy protection off" badge when privacy is available but disabled', () => {
			const domain = createMockDomain( {
				privacy_available: true,
				private_domain: false,
			} );

			render( <ContactDetailsSummary domain={ domain } /> );

			const badge = screen.getByTestId( 'badge-0' );
			expect( badge ).toHaveTextContent( 'Privacy protection off' );

			// Check that the badge data has no intent (undefined)
			const button = screen.getByTestId( 'router-link-summary-button' );
			const badgesData = JSON.parse( button.getAttribute( 'data-badges' ) || '[]' );
			expect( badgesData[ 0 ] ).toEqual( {
				text: 'Privacy protection off',
				intent: undefined,
			} );
		} );

		test( 'displays no badges when privacy is not available', () => {
			const domain = createMockDomain( {
				privacy_available: false,
				private_domain: false,
			} );

			render( <ContactDetailsSummary domain={ domain } /> );

			// Should not have any badges
			expect( screen.queryByTestId( 'badge-0' ) ).not.toBeInTheDocument();

			// Check that badges array is empty
			const button = screen.getByTestId( 'router-link-summary-button' );
			const badgesData = JSON.parse( button.getAttribute( 'data-badges' ) || '[]' );
			expect( badgesData ).toHaveLength( 0 );
		} );

		test( 'displays no badges when privacy is not available even if private_domain is true', () => {
			const domain = createMockDomain( {
				privacy_available: false,
				private_domain: true,
			} );

			render( <ContactDetailsSummary domain={ domain } /> );

			// Should not have any badges
			expect( screen.queryByTestId( 'badge-0' ) ).not.toBeInTheDocument();

			// Check that badges array is empty
			const button = screen.getByTestId( 'router-link-summary-button' );
			const badgesData = JSON.parse( button.getAttribute( 'data-badges' ) || '[]' );
			expect( badgesData ).toHaveLength( 0 );
		} );
	} );

	describe( 'navigation functionality', () => {
		test( 'navigates to correct contact details URL when clicked', async () => {
			const user = userEvent.setup();
			const domain = createMockDomain( {
				domain: 'test-domain.com',
			} );

			render( <ContactDetailsSummary domain={ domain } /> );

			const button = screen.getByTestId( 'router-link-summary-button' );
			expect( button ).toHaveAttribute( 'data-to', '/domains/test-domain.com/contact-details' );

			await user.click( button );

			// Check that navigation was triggered
			expect( mockNavigateTo ).toHaveBeenCalledWith( '/domains/test-domain.com/contact-details' );
		} );

		test( 'displays correct title', () => {
			const domain = createMockDomain();

			render( <ContactDetailsSummary domain={ domain } /> );

			const button = screen.getByTestId( 'router-link-summary-button' );
			expect( button ).toHaveAttribute( 'data-title', 'Contact details & privacy' );
			expect( button ).toHaveTextContent( 'Contact details & privacy' );
		} );

		test( 'respects disabled prop', () => {
			const domain = createMockDomain();

			render( <ContactDetailsSummary domain={ domain } isDisabled /> );

			const button = screen.getByTestId( 'router-link-summary-button' );
			expect( button ).toHaveAttribute( 'data-disabled', 'true' );
		} );

		test( 'is enabled by default when isDisabled is not provided', () => {
			const domain = createMockDomain();

			render( <ContactDetailsSummary domain={ domain } /> );

			const button = screen.getByTestId( 'router-link-summary-button' );
			expect( button ).toHaveAttribute( 'data-disabled', 'false' );
		} );

		test( 'is enabled when isDisabled is explicitly false', () => {
			const domain = createMockDomain();

			render( <ContactDetailsSummary domain={ domain } isDisabled={ false } /> );

			const button = screen.getByTestId( 'router-link-summary-button' );
			expect( button ).toHaveAttribute( 'data-disabled', 'false' );
		} );
	} );

	describe( 'component integration', () => {
		test( 'renders with all expected props passed to RouterLinkSummaryButton', () => {
			const domain = createMockDomain( {
				domain: 'integration-test.com',
				privacy_available: true,
				private_domain: true,
			} );

			render( <ContactDetailsSummary domain={ domain } isDisabled={ false } /> );

			const button = screen.getByTestId( 'router-link-summary-button' );

			// Check all props are correctly passed
			expect( button ).toHaveAttribute(
				'data-to',
				'/domains/integration-test.com/contact-details'
			);
			expect( button ).toHaveAttribute( 'data-title', 'Contact details & privacy' );
			expect( button ).toHaveAttribute( 'data-disabled', 'false' );

			// Check badges
			const badgesData = JSON.parse( button.getAttribute( 'data-badges' ) || '[]' );
			expect( badgesData ).toHaveLength( 1 );
			expect( badgesData[ 0 ] ).toEqual( {
				text: 'Privacy protection on',
				intent: 'success',
			} );
		} );
	} );
} );
