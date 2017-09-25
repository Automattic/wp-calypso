/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'WpcomLoginForm', () => {
	let WpcomLoginForm, mockHostname;
	const props = {
		log: 'log_text',
		pwd: 'secret',
		authorization: 'authorization_token',
		redirectTo: 'https://test.wordpress.com',
	};

	useMockery( mockery => {
		mockery.registerMock( 'config', () => mockHostname );
	} );

	before( () => {
		WpcomLoginForm = require( '..' );
	} );

	beforeEach( () => {
		mockHostname = 'wordpress.com';
	} );

	it( 'should render default fields as expected.', () => {
		const wrapper = shallow(
			<WpcomLoginForm { ...props } />
		);

		// should render root form element
		const form = wrapper.find( 'form' );
		expect( form ).to.have.length( 1 );
		expect( form.prop( 'method' ) ).to.equal( 'post' );
		expect( form.prop( 'action' ) ).to.equal( 'https://test.wordpress.com/wp-login.php' );

		// form should include default hidden elements
		expect( wrapper.find( 'form > input[type="hidden"]' ) ).to.have.length( 4 );
		expect( wrapper.find( 'form > input[name="log"]' ).prop( 'value' ) ).to.equal( 'log_text' );
		expect( wrapper.find( 'form > input[name="pwd"]' ).prop( 'value' ) ).to.equal( 'secret' );
		expect( wrapper.find( 'form > input[name="authorization"]' ).prop( 'value' ) ).to.equal( 'authorization_token' );
		expect( wrapper.find( 'form > input[name="redirect_to"]' ).prop( 'value' ) ).to.equal( 'https://test.wordpress.com' );

		// when update a prop
		wrapper.setProps( { log: 'another_log' } );
		expect( wrapper.find( 'form > input[name="log"]' ).prop( 'value' ) ).to.equal( 'another_log' );
	} );

	it( 'should render extra fields if extraFields prop is passed.', () => {
		const wrapper = shallow(
			<WpcomLoginForm
				{ ...props }
				extraFields={ {
					foo: 'bar',
					lorem: 'ipsum'
				} }
			/>
		);

		expect( wrapper.find( 'input[type="hidden"]' ) ).to.have.length( 6 );
		expect( wrapper.find( 'input[name="foo"]' ).prop( 'value' ) ).to.equal( 'bar' );
		expect( wrapper.find( 'input[name="lorem"]' ).prop( 'value' ) ).to.equal( 'ipsum' );
	} );

	it( 'its action should be under the wpcom subdomain that `redirectTo` prop contains.', () => {
		const wrapper = shallow(
			<WpcomLoginForm { ...props } redirectTo="https://foo.wordpress.com" />
		);

		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://foo.wordpress.com/wp-login.php' );

		wrapper.setProps( { redirectTo: 'https://bar.wordpress.com' } );
		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://bar.wordpress.com/wp-login.php' );
	} );

	it( 'its action should has no subdomain when `hostname` is wpcalypso.wpcom or horizon.wpcom.', () => {
		const wrapper = shallow(
			<WpcomLoginForm { ...props } redirectTo="https://foo.wordpress.com" />
		);

		// should has the same hostname with redirectTo prop.
		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://foo.wordpress.com/wp-login.php' );

		// should be default url
		mockHostname = 'wpcalypso.wordpress.com';
		wrapper.setProps( { log: 'wpcalpso' } ); // to update form action
		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://wordpress.com/wp-login.php' );

		// should has the same hostname with redirectTo prop.
		mockHostname = 'bar.wordpress.com';
		wrapper.setProps( { log: 'bar' } ); // to update form action
		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://foo.wordpress.com/wp-login.php' );

		// should be default url
		mockHostname = 'horizon.wordpress.com';
		wrapper.setProps( { log: 'horizon' } ); // to update form action
		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://wordpress.com/wp-login.php' );
	} );

	it( 'its action should has no subdomain when `redirectTo` prop is not a subdomain of wpcom.', () => {
		const wrapper = shallow(
			<WpcomLoginForm { ...props } redirectTo="https://wordpress.org" />
		);

		expect( wrapper.find( 'form' ).prop( 'action' ) ).to.equal( 'https://wordpress.com/wp-login.php' );
	} );
} );
