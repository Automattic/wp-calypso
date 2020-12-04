/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import Modal from 'react-modal';
import moment from 'moment';
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

	const mockPurchases = () => [
		{
			id: 1,
			currencyCode: 'USD',
			expiryDate: moment().add( 20, 'days' ).format(),
			expiryStatus: 'expiring',
			renewDate: '',
			productSlug: 'personal-bundle',
			productName: 'Personal Plan',
			amount: 100,
		},
		{
			id: 2,
			currencyCode: 'USD',
			expiryDate: moment().add( 10, 'days' ).format(),
			expiryStatus: 'expiring',
			renewDate: '',
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
				isVisible
				purchases={ mockPurchases() }
				site={ site }
				onConfirm={ jest.fn() }
				onClose={ jest.fn() }
			/>
		);

		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__name' )[ 0 ]
		).toHaveTextContent(
			/personalsitetest1234\.liveDotLive Domain Registration: expires in 10 days/
		);
		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__price' )[ 0 ]
		).toHaveTextContent( '$200' );
		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__name' )[ 1 ]
		).toHaveTextContent( /Personal PlanSite Plan: expires in 20 days/ );
		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__price' )[ 1 ]
		).toHaveTextContent( '$100' );
	} );

	test( 'uses the renewDate to display and sort purposes for autoRenewing purchases', () => {
		const purchases = [
			...mockPurchases(),
			{
				id: 3,
				currencyCode: 'USD',
				expiryDate: moment().add( 35, 'days' ).format(),
				expiryStatus: 'autoRenewing',
				renewDate: moment().add( 5, 'days' ).format(),
				productSlug: 'dotlive_domain',
				meta: 'autorenewing-domain.live',
				productName: 'DotLive Domain Registration',
				isDomainRegistration: true,
				amount: 200,
			},
		];
		render(
			<UpcomingRenewalsDialog
				isVisible
				purchases={ purchases }
				site={ site }
				onConfirm={ jest.fn() }
				onClose={ jest.fn() }
			/>
		);

		expect(
			document.body.querySelectorAll( '.upcoming-renewals-dialog__name' )[ 0 ]
		).toHaveTextContent( /autorenewing-domain\.liveDotLive Domain Registration: renews in 5 days/ );
	} );

	test( 'selects all purchases by default', () => {
		const onConfirm = jest.fn();
		const purchases = mockPurchases();
		render(
			<UpcomingRenewalsDialog
				isVisible
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
		const purchases = mockPurchases();
		render(
			<UpcomingRenewalsDialog
				isVisible
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
				isVisible
				purchases={ mockPurchases() }
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
