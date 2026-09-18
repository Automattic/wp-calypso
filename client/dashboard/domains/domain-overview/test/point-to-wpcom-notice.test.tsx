/**
 * @jest-environment jsdom
 */
import { DomainSubtype, DomainTransferStatus, type Domain } from '@automattic/api-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PointToWpcomNotice from '../point-to-wpcom-notice';

const domainName = 'example.com';

const NOTICE_TITLE = 'Transfer completed';
const BUTTON_LABEL = 'Point to WordPress.com';

const getMockedDomainData = ( customProps: Partial< Domain > = {} ): Domain =>
	( {
		domain: domainName,
		owner: 'owner@example.com',
		current_user_is_owner: true,
		points_to_wpcom: false,
		transfer_status: DomainTransferStatus.COMPLETED,
		subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Domain Registration' },
		...customProps,
	} ) as Domain;

describe( 'PointToWpcomNotice', () => {
	test( 'renders the notice with the button for the owner', () => {
		render( <PointToWpcomNotice domain={ getMockedDomainData() } /> );

		expect( screen.getByText( NOTICE_TITLE ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: BUTTON_LABEL } ) ).toBeVisible();
	} );

	test( 'renders the notice without the button for a non-owner', () => {
		render(
			<PointToWpcomNotice domain={ getMockedDomainData( { current_user_is_owner: false } ) } />
		);

		expect( screen.getByText( NOTICE_TITLE ) ).toBeVisible();
		expect( screen.getByText( 'owner@example.com' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: BUTTON_LABEL } ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the domain points to WordPress.com', () => {
		render( <PointToWpcomNotice domain={ getMockedDomainData( { points_to_wpcom: true } ) } /> );

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when the domain has no transfer status', () => {
		render( <PointToWpcomNotice domain={ getMockedDomainData( { transfer_status: null } ) } /> );

		expect( screen.queryByText( NOTICE_TITLE ) ).not.toBeInTheDocument();
	} );

	test( 'confirming the dialog posts the domain to the point-to-wpcom endpoint', async () => {
		const user = userEvent.setup();
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/domains/point-to-wpcom', ( body ) => {
				expect( body ).toEqual( { domain: domainName } );
				return true;
			} )
			.reply( 200 );

		render( <PointToWpcomNotice domain={ getMockedDomainData() } /> );

		await user.click( screen.getByRole( 'button', { name: BUTTON_LABEL } ) );

		const dialog = await screen.findByRole( 'dialog' );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );
} );
