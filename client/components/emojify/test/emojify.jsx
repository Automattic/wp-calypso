/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Emojify from '..';
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Emojify', function() {
	useFakeDom();

	context( 'component rendering', () => {
		it( 'wraps a string in a div', () => {
			const wrapper = shallow(
				<Emojify>Foo</Emojify>
			);
			expect( wrapper.find( 'div' ).node.ref ).to.equal( 'emojified' );
		} );

		it( 'wraps a block in a div', () => {
			const wrapper = shallow(
				<Emojify><p>Bar</p></Emojify>
			);
			expect( wrapper.find( 'div' ).node.ref ).to.equal( 'emojified' );
		} );

		it( 'replaces emoji in a string', () => {
			global.Image = window.Image;

			const wrapper = mount(
				<Emojify>🙂</Emojify>
			);

			delete global.Image;

			expect( wrapper.html() ).to.equal(
				'<div class="emojify"><img draggable="false" class="emojify__emoji" alt="🙂" ' +
				'src="https://s0.wp.com/wp-content/mu-plugins/wpcom-smileys/twemoji/2/72x72/1f642.png"></div>'
			);
		} );

		it( 'replaces emoji in a block', () => {
			global.Image = window.Image;

			const wrapper = mount(
				<Emojify><p>🧔🏻</p></Emojify>
			);

			delete global.Image;

			expect( wrapper.html() ).to.equal(
				'<div class="emojify"><p><img draggable="false" class="emojify__emoji" alt="🧔🏻" ' +
				'src="https://s0.wp.com/wp-content/mu-plugins/wpcom-smileys/twemoji/2/72x72/1f9d4-1f3fb.png"></p></div>'
			);
		} );

		it( 'maintains custom props', () => {
			const wrapper = shallow(
				<Emojify alt="bar">השנה היא 2017.</Emojify>
			);
			expect( wrapper.node.props.alt ).to.equal( 'bar' );
		} );
	} );
} );
