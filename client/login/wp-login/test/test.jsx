/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Login', () => {
	let Login;

	useFakeDom();

	before( () => {
		Login = require( '../index.jsx' ).Login;
	} );

	describe( 'footerLinks', () => {
		context( 'when state is not loaded', () => {
			it( 'should not have a return button', () => {
				const login = shallow(
					<Login queryArguments={ { redirect_to: '' } } translate={ identity } />
				);

				expect( login.find( '.wp-login__footer > a' ).length ).to.equal( 1 );
			} );
		} );

		context( 'after state is loaded', () => {
			context( 'there is no history', () => {
				it( 'should not have a return button', () => {
					const login = shallow(
						<Login queryArguments={ { redirect_to: '' } } translate={ identity } />
					);
					login.setState( { loaded: true } );

					expect( login.find( '.wp-login__footer > a' ).length ).to.equal( 1 );
				} );
			} );

			context( 'there is history', () => {
				before( () => {
					window.history.pushState( {}, '' );
				} );

				it( 'should have a return button if there is history', () => {
					const login = shallow(
						<Login queryArguments={ { redirect_to: '' } } translate={ identity } />
					);
					login.setState( { loaded: true } );

					expect( login.find( '.wp-login__footer > a' ).length ).to.equal( 2 );
				} );

				after( () => {
					window.history.back();
				} );
			} );
		} );
	} );
} );
