/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import PurchaseDetail from '..';
import PurchaseButton from '../purchase-button';
import TipInfo from '../tip-info';

jest.mock( '../tip-info', () => jest.fn( () => <div data-testid="tip-info" /> ) );
jest.mock( '../purchase-button', () => jest.fn( () => <div data-testid="purchase-button" /> ) );

const noop = () => {};

describe( 'PurchaseDetail', () => {
	test( 'should be a placeholder if in need', () => {
		const { container, rerender } = render( <PurchaseDetail /> );
		expect( container.firstChild ).not.toHaveClass( 'is-placeholder' );

		rerender( <PurchaseDetail isPlaceholder /> );
		expect( container.firstChild ).toHaveClass( 'is-placeholder' );
	} );

	test( 'should render given title and description', () => {
		render( <PurchaseDetail title="test:title" description="test:description" /> );

		const title = screen.queryByText( 'test:title' );
		expect( title ).toBeVisible();
		expect( title ).toHaveClass( 'purchase-detail__title' );

		const description = screen.queryByText( 'test:description' );
		expect( description ).toBeVisible();
		expect( description ).toHaveClass( 'purchase-detail__description' );
	} );

	test( 'should render given notice text', () => {
		render( <PurchaseDetail requiredText="test:notice" /> );

		const notice = screen.queryByText( 'test:notice' );
		expect( notice ).toBeVisible();
		expect( notice.parentNode ).toHaveClass( 'purchase-detail__required-notice' );
	} );

	test( 'should render given body text', () => {
		render( <PurchaseDetail body="test:body" /> );

		const body = screen.queryByText( 'test:body' );
		expect( body ).toBeVisible();
		expect( body ).toHaveClass( 'purchase-detail__body' );
	} );

	test( 'should render a <TipInfo /> with given tip info unless the body text is passed', () => {
		const { rerender } = render( <PurchaseDetail info="test:tip-info" /> );

		const tipInfo = screen.queryByTestId( 'tip-info' );
		expect( tipInfo ).toBeVisible();
		expect( TipInfo ).toHaveBeenCalledWith(
			expect.objectContaining( { info: 'test:tip-info' } ),
			expect.anything()
		);

		rerender( <PurchaseDetail info="test:tip-info" body="test:body" /> );
		expect( screen.queryByTestId( 'tip-info' ) ).not.toBeInTheDocument();
	} );

	test( 'should render a <PurchaseButton> with given info unless the body text is passed', () => {
		const buttonProps = {
			isSubmitting: false,
			href: 'https://wordpress.com/test/url',
			onClick: noop,
			target: 'test:target',
			rel: 'test:rel',
			buttonText: 'test:button-text',
		};

		const { rerender } = render( <PurchaseDetail { ...buttonProps } /> );

		const purchaseButton = screen.queryByTestId( 'purchase-button' );
		expect( purchaseButton ).toBeVisible();

		expect( PurchaseButton ).toHaveBeenCalledWith(
			expect.objectContaining( {
				disabled: false,
				href: 'https://wordpress.com/test/url',
				onClick: noop,
				target: 'test:target',
				rel: 'test:rel',
				text: buttonProps.buttonText,
			} ),
			expect.anything()
		);

		rerender( <PurchaseDetail { ...buttonProps } body="test:body" /> );
		expect( screen.queryByTestId( 'purchase-button' ) ).not.toBeInTheDocument();
	} );
} );
