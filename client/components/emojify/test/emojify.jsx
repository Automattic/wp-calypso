/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import Emojify from '..';

describe( 'Emojify', () => {
	describe( 'component rendering', () => {
		const twemojiUrl = config( 'twemoji_cdn_url' );
		test( 'wraps a string in a div', () => {
			const wrapper = shallow( <Emojify>Foo</Emojify>, {
				disableLifecycleMethods: true,
			} );
			expect( wrapper.html() ).to.equal( '<div class="emojify">Foo</div>' );
		} );

		test( 'wraps a block in a div', () => {
			const wrapper = shallow(
				<Emojify>
					<p>Bar</p>
				</Emojify>,
				{ disableLifecycleMethods: true }
			);
			expect( wrapper.html() ).to.equal( '<div class="emojify"><p>Bar</p></div>' );
		} );

		test( 'wraps a block in a certain tag, if tagName is specified', () => {
			const wrapper = shallow( <Emojify tagName="span">Bar</Emojify>, {
				disableLifecycleMethods: true,
			} );
			expect( wrapper.html() ).to.equal( '<span class="emojify">Bar</span>' );
		} );

		test( 'replaces emoji in a string', () => {
			const wrapper = mount( <Emojify twemojiUrl={ twemojiUrl }>🙂</Emojify> );

			expect( wrapper.html() ).to.equal(
				'<div class="emojify"><img draggable="false" class="emojify__emoji" alt="🙂" ' +
					'src="https://s0.wp.com/wp-content/mu-plugins/wpcom-smileys/twemoji/2/72x72/1f642.png"></div>'
			);
		} );

		test( 'replaces emoji in a block', () => {
			const wrapper = mount(
				<Emojify twemojiUrl={ twemojiUrl }>
					<p>🧔🏻</p>
				</Emojify>
			);

			expect( wrapper.html() ).to.equal(
				'<div class="emojify"><p><img draggable="false" class="emojify__emoji" alt="🧔🏻" ' +
					'src="https://s0.wp.com/wp-content/mu-plugins/wpcom-smileys/twemoji/2/72x72/1f9d4-1f3fb.png"></p></div>'
			);
		} );

		test( 'maintains custom props', () => {
			const wrapper = shallow( <Emojify alt="bar">השנה היא 2017.</Emojify>, {
				disableLifecycleMethods: true,
			} );
			expect( wrapper.getElement().props.alt ).to.equal( 'bar' );
		} );
	} );
} );
