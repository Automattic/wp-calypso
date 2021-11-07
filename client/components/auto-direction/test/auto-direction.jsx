/**
 * @jest-environment jsdom
 */

import { expect } from 'chai';
import { shallow } from 'enzyme';
import AutoDirection from '..';

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
	} );
} );
