/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import AutoDirection from '..';
import Emojify from 'components/emojify';

describe( 'AutoDirection', function() {
	describe( 'component rendering', () => {
		it( 'adds a direction to RTL text', () => {
			const wrapper = shallow(
				<AutoDirection><div>השנה היא 2017.</div></AutoDirection>
			);

			expect( wrapper.node.props.direction ).to.equal( 'rtl' );
		} );

		it( "doesn't add a direction to LTR text", () => {
			const wrapper = shallow(
				<AutoDirection><div>The year is 2017.</div></AutoDirection>
			);

			expect( wrapper.node.props ).to.not.have.property( 'direction' );
		} );

		it( 'adds a direction to the parent of an inline component', () => {
			const wrapper = shallow(
				<AutoDirection><div><Emojify>השנה היא 2017.</Emojify></div></AutoDirection>
			);

			expect( wrapper.node.props.direction ).to.equal( 'rtl' );

			// Things get weird when mounting a stateless component, so just check for the HTML, instead.
			expect( wrapper.html() ).to.include( '<div class="emojify">השנה היא 2017.</div>' );
		} );
	} );
} );
