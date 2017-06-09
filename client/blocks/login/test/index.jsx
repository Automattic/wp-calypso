/**
 * External dependencies
 */
import { expect } from 'chai';
import { noop } from 'lodash';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import config from 'config';

describe( 'Login', function() {
	let Login;

	useFakeDom();

	before( () => {
		Login = require( 'blocks/login' ).Login;
	} );

	context( '#rebootAfterLogin()', () => {
		const defaultProps = {
			twoFactorEnabled: false,
			recordTracksEvent: noop,
			translate: noop,
		};
		const origin = `https://${ config( 'hostname' ) }`;

		beforeEach( () => {
			// mock window.location
			global.window = {
				location: {
					href: origin + '/log-in',
					origin,
				}
			};
		} );

		it( 'should successfully redirect to an absolute route', () => {
			const wrapper = shallow( <Login redirectLocation={ '/themes' } { ...defaultProps } /> );

			wrapper.instance().rebootAfterLogin();

			expect( window.location.href ).to.equal( '/themes' );
		} );

		it( 'should successfully redirect to a relative route', () => {
			const wrapper = shallow( <Login redirectLocation={ 'themes' } { ...defaultProps } /> );

			wrapper.instance().rebootAfterLogin();

			expect( window.location.href ).to.equal( 'themes' );
		} );

		it( 'should successfully redirect to a valid url if it matches the origin', () => {
			const wrapper = shallow( <Login redirectLocation={ origin + '/themes' } { ...defaultProps } /> );

			wrapper.instance().rebootAfterLogin();

			expect( window.location.href ).to.equal( origin + '/themes' );
		} );

		it( 'should redirect to / if the hostname does not match the origin', () => {
			const wrapper = shallow( <Login redirectLocation={ '//suspicious-site.com/fishing' } { ...defaultProps } /> );

			wrapper.instance().rebootAfterLogin();

			expect( window.location.href ).to.equal( origin );
		} );
	} );
} );
