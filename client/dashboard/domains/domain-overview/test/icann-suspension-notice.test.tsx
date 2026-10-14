/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import IcannSuspensionNotice from '../icann-suspension-notice';
import type { Domain } from '@automattic/api-core';

const getMockedDomain = ( customProps: Partial< Domain > = {} ): Domain => {
	return {
		domain: 'example.com',
		current_user_is_owner: true,
		is_pending_icann_verification: true,
		is_icann_verification_suspended: false,
		domain_registrant_email: 'registrant@example.com',
		contact_verification_deadline: '2026-09-30T00:00:00+00:00',
		...customProps,
	} as Domain;
};

describe( '<IcannSuspensionNotice>', () => {
	describe( 'pending verification', () => {
		beforeEach( () => {
			jest.useFakeTimers( { now: new Date( '2026-09-24T10:00:00+00:00' ) } );
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		test( 'shows the registrant email and the deadline', () => {
			render( <IcannSuspensionNotice domain={ getMockedDomain() } /> );

			expect( screen.getByText( 'Email verification required' ) ).toBeVisible();
			expect( screen.getByText( 'registrant@example.com' ) ).toBeVisible();
			expect( screen.getByText( 'September 30, 2026' ) ).toBeVisible();
			expect(
				screen.getByText( /Follow the instructions in that email by/, { exact: false } )
			).toBeVisible();
		} );

		test( 'omits the deadline sentence when there is no deadline', () => {
			render(
				<IcannSuspensionNotice
					domain={ getMockedDomain( { contact_verification_deadline: null } ) }
				/>
			);

			expect(
				screen.getByText(
					'Follow the instructions in that email or your domain will be suspended.',
					{ exact: false }
				)
			).toBeVisible();
			expect( screen.queryByText( /by/, { exact: false } ) ).not.toBeInTheDocument();
		} );

		test( 'omits the deadline sentence when the deadline has already passed', () => {
			render(
				<IcannSuspensionNotice
					domain={ getMockedDomain( {
						contact_verification_deadline: '2026-09-01T12:16:32+00:00',
					} ) }
				/>
			);

			expect(
				screen.getByText(
					'Follow the instructions in that email or your domain will be suspended.',
					{ exact: false }
				)
			).toBeVisible();
			expect( screen.queryByText( 'September 1, 2026' ) ).not.toBeInTheDocument();
		} );

		test( 'falls back to a generic message when the registrant email is unknown', () => {
			render(
				<IcannSuspensionNotice domain={ getMockedDomain( { domain_registrant_email: null } ) } />
			);

			expect(
				screen.getByText(
					'We sent a verification email to your domain’s contact address, which may differ from your WordPress.com account email.',
					{ exact: false }
				)
			).toBeVisible();
			expect( screen.queryByText( 'registrant@example.com' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'suspended', () => {
		test( 'explains the suspension and shows the registrant email', () => {
			render(
				<IcannSuspensionNotice
					domain={ getMockedDomain( { is_icann_verification_suspended: true } ) }
				/>
			);

			expect( screen.getByText( 'Domain suspended' ) ).toBeVisible();
			expect( screen.getByText( 'example.com' ) ).toBeVisible();
			expect(
				screen.getByText( 'was suspended because its contact email address was not verified.', {
					exact: false,
				} )
			).toBeVisible();
			expect( screen.getByText( 'registrant@example.com' ) ).toBeVisible();
			expect( screen.queryByText( 'Email verification required' ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'links to the contact details page and offers to resend the email', () => {
		render( <IcannSuspensionNotice domain={ getMockedDomain() } /> );

		expect(
			screen.getByRole( 'link', { name: 'change the contact email address' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeVisible();
	} );

	test( 'does not offer to change the contact email address to users who do not own the domain', () => {
		render(
			<IcannSuspensionNotice domain={ getMockedDomain( { current_user_is_owner: false } ) } />
		);

		expect(
			screen.queryByRole( 'link', { name: 'change the contact email address' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByText( 'If you no longer have access to it', { exact: false } )
		).not.toBeInTheDocument();
		expect( screen.getByText( 'registrant@example.com' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeVisible();
	} );
} );
