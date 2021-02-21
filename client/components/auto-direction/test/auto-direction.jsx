/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import AutoDirection from '..';
import Emojify from 'calypso/components/emojify';

describe( 'AutoDirection', () => {
	describe( 'component rendering', () => {
		test( 'adds a direction to RTL text', () => {
			const wrapper = shallow(
				<AutoDirection>
					<div>השנה היא 2017.</div>
				</AutoDirection>
			);

			expect( wrapper.getElement().props.direction ).to.equal( 'rtl' );
		} );

		test( "doesn't add a direction to LTR text", () => {
			const wrapper = shallow(
				<AutoDirection>
					<div>The year is 2017.</div>
				</AutoDirection>
			);

			expect( wrapper.getElement().props ).to.not.have.property( 'direction' );
		} );

		test( 'adds a direction to the parent of an inline component', () => {
			const wrapper = shallow(
				<AutoDirection>
					<div>
						<Emojify>השנה היא 2017.</Emojify>
					</div>
				</AutoDirection>
			);

			expect( wrapper.getElement().props.direction ).to.equal( 'rtl' );

			// Things get weird when mounting a stateless component, so just check for the HTML, instead.
			expect( wrapper.html() ).to.include( '<div class="emojify">השנה היא 2017.</div>' );
		} );
	} );
} );
