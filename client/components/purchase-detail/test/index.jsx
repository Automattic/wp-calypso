/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import PurchaseDetail from '..';
import PurchaseButton from '../purchase-button';
import TipInfo from '../tip-info';

describe( 'PurchaseDetail', () => {
	let wrapper;

	test( 'should be a placeholder if in need', () => {
		wrapper = shallow( <PurchaseDetail /> );
		expect( wrapper.hasClass( 'is-placeholder' ) ).to.be.false;

		wrapper = shallow( <PurchaseDetail isPlaceholder /> );
		expect( wrapper.hasClass( 'is-placeholder' ) ).to.be.true;
	} );

	test( 'should render given title and description', () => {
		wrapper = shallow( <PurchaseDetail title="test:title" description="test:description" /> );
		expect( wrapper.find( '.purchase-detail__title' ).props().children ).to.equal( 'test:title' );
		expect( wrapper.find( '.purchase-detail__description' ).props().children ).to.equal(
			'test:description'
		);
	} );

	test( 'should render given notice text', () => {
		wrapper = shallow( <PurchaseDetail requiredText="test:notice" /> );

		const notice = wrapper.find( '.purchase-detail__required-notice > em' );
		expect( notice ).to.have.length( 1 );
		expect( notice.props().children ).to.equal( 'test:notice' );
	} );

	test( 'should render given body text', () => {
		wrapper = shallow( <PurchaseDetail body="test:body" /> );

		const body = wrapper.find( '.purchase-detail__body' );
		expect( body ).to.have.length( 1 );
		expect( body.props().children ).to.equal( 'test:body' );
	} );

	test( 'should render a <TipInfo /> with given tip info unless the body text is passed', () => {
		wrapper = shallow( <PurchaseDetail info="test:tip-info" /> );

		const tipInfo = wrapper.find( TipInfo );
		expect( tipInfo ).to.have.length( 1 );
		expect( tipInfo.prop( 'info' ) ).to.equal( 'test:tip-info' );

		wrapper = shallow( <PurchaseDetail info="test:tip-info" body="test:body" /> );
		expect( wrapper.find( TipInfo ) ).to.have.length( 0 );
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

		wrapper = shallow( <PurchaseDetail { ...buttonProps } /> );

		const purchaseButton = wrapper.find( PurchaseButton );
		expect( purchaseButton ).to.have.length( 1 );
		expect( purchaseButton.prop( 'disabled' ) ).to.be.false;
		expect( purchaseButton.prop( 'href' ) ).to.equal( 'https://wordpress.com/test/url' );
		expect( purchaseButton.prop( 'onClick' ) ).to.equal( noop );
		expect( purchaseButton.prop( 'target' ) ).to.equal( 'test:target' );
		expect( purchaseButton.prop( 'rel' ) ).to.equal( 'test:rel' );
		expect( purchaseButton.prop( 'text' ) ).to.equal( buttonProps.buttonText );

		wrapper = shallow( <PurchaseDetail { ...buttonProps } body="test:body" /> );
		expect( wrapper.find( PurchaseButton ) ).to.have.length( 0 );
	} );
} );
