/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import Modal from 'react-modal';
import { render, fireEvent, screen } from '@testing-library/react';
import { unmountComponentAtNode } from 'react-dom';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import UpcomingRenewalsDialog from '../upcoming-renewals-dialog';

describe( '<UpcomingRenewalsDialog>', () => {
	let modalRoot;

	beforeEach( () => {
		modalRoot = document.createElement( 'div' );
		modalRoot.setAttribute( 'id', 'modal-root' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		unmountComponentAtNode( modalRoot );
		document.body.removeChild( modalRoot );
		modalRoot = null;
	} );

	const purchases = [
		{
			id: 1,
			currencyCode: 'USD',
			expiryDate: '2020-05-20T00:00:00+00:00',
			productSlug: 'personal-bundle',
			productName: 'Personal Plan',
			amount: 100,
		},
		{
			id: 2,
			currencyCode: 'USD',
			expiryDate: '2020-05-15T00:00:00+00:00',
			productSlug: 'dotlive_domain',
			meta: 'personalsitetest1234.live',
			productName: 'DotLive Domain Registration',
			isDomainRegistration: true,
			amount: 200,
		},
	];

	const site = {
		domain: 'personalsitetest1234.wordpress.com',
		slug: 'personalsitetest1234.wordpress.com',
	};

	test( 'displays names and price for each purchase ordered by expiration date ascending', () => {
		render(
			<UpcomingRenewalsDialog
				isVisible={ true }
				purchases={ purchases }
				site={ site }
				onConfirm={ jest.fn() }
				onClose={ jest.fn() }
			/>
		);

		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__name' )[ 0 ]
		).toHaveTextContent( /personalsitetest1234\.liveDotLive Domain Registration: expire[sd]/ );
		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__price' )[ 0 ]
		).toHaveTextContent( '$200' );
		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__name' )[ 1 ]
		).toHaveTextContent( /Personal PlanSite Plan: expire[sd]/ );
		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__price' )[ 1 ]
		).toHaveTextContent( '$100' );
	} );

	test( 'selects all purchases by default', () => {
		const onConfirm = jest.fn();
		render(
			<UpcomingRenewalsDialog
				isVisible={ true }
				purchases={ purchases }
				site={ site }
				onConfirm={ onConfirm }
				onClose={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByText( 'Renew now' ) );

		expect( onConfirm ).toHaveBeenCalledWith( purchases );
	} );

	test( 'submits only the selected purchases', () => {
		const onConfirm = jest.fn();
		render(
			<UpcomingRenewalsDialog
				isVisible={ true }
				purchases={ purchases }
				site={ site }
				onConfirm={ onConfirm }
				onClose={ jest.fn() }
			/>
		);

		fireEvent.click( document.body.querySelector( 'input[name=personal-bundle-1]' ) );
		fireEvent.click( screen.getByText( 'Renew now' ) );

		expect( onConfirm ).toHaveBeenCalledWith( [ purchases[ 1 ] ] );
	} );

	test( 'disables the submit button if no purchases are selected', () => {
		render(
			<UpcomingRenewalsDialog
				isVisible={ true }
				purchases={ purchases }
				site={ site }
				onConfirm={ jest.fn() }
				onClose={ jest.fn() }
			/>
		);

		fireEvent.click( document.body.querySelector( 'input[name=dotlive_domain-2]' ) );

		fireEvent.click( document.body.querySelector( 'input[name=personal-bundle-1]' ) );

		expect( screen.getByText( 'Renew now' ) ).toHaveProperty( 'disabled', true );
	} );
} );
