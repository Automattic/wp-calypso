/**
 * External dependencies
 */
import { mount } from 'enzyme';
import { each } from 'lodash';

/**
 * WordPress dependencies
 */
import { UP, DOWN, TAB, LEFT, RIGHT, SPACE } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import { TabbableContainer, NavigableMenu } from '../';

function simulateVisible( wrapper, selector ) {
	const elements = wrapper.getDOMNode().querySelectorAll( selector );
	each( elements, ( elem ) => {
		elem.getClientRects = () => [ 'trick-jsdom-into-having-size-for-element-rect' ];
	} );
}

function fireKeyDown( container, keyCode, shiftKey ) {
	const interaction = {
		stopped: false,
	};

	container.simulate( 'keydown', {
		stopPropagation: () => {
			interaction.stopped = true;
		},
		preventDefault: () => {},
		nativeEvent: {
			stopImmediatePropagation: () => { },
		},
		keyCode,
		shiftKey,
	} );

	return interaction;
}

describe( 'NavigableMenu', () => {
	it( 'vertical: should navigate by up and down', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<NavigableMenu orientation="vertical" onNavigate={ ( index ) => currentIndex = index }>
				<span tabIndex="-1" id="btn1">One</span>
				<span tabIndex="-1" id="btn2">Two</span>
				<span id="btn-deep-wrapper">
					<span id="btn-deep" tabIndex="-1">Deep</span>
				</span>
				<span tabIndex="-1" id="btn3">Three</span>
			</NavigableMenu>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div' );
		wrapper.getDOMNode().querySelector( '#btn1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode, false );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( DOWN, 1, true );
		assertKeyDown( DOWN, 2, true );
		assertKeyDown( DOWN, 3, true );
		assertKeyDown( DOWN, 0, true );
		assertKeyDown( UP, 3, true );
		assertKeyDown( UP, 2, true );
		assertKeyDown( UP, 1, true );
		assertKeyDown( UP, 0, true );
		assertKeyDown( LEFT, 0, false );
		assertKeyDown( RIGHT, 0, false );
		assertKeyDown( SPACE, 0, false );
	} );

	it( 'vertical: should navigate by up and down, and stop at edges', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<NavigableMenu cycle={ false } orientation="vertical" onNavigate={ ( index ) => currentIndex = index }>
				<span tabIndex="-1" id="btn1">One</span>
				<span tabIndex="-1" id="btn2">Two</span>
				<span tabIndex="-1" id="btn3">Three</span>
			</NavigableMenu>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div' );
		wrapper.getDOMNode().querySelector( '#btn1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode, false );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( DOWN, 1, true );
		assertKeyDown( DOWN, 2, true );
		assertKeyDown( DOWN, 2, true );
		assertKeyDown( UP, 1, true );
		assertKeyDown( UP, 0, true );
		assertKeyDown( UP, 0, true );
		assertKeyDown( LEFT, 0, false );
		assertKeyDown( RIGHT, 0, false );
		assertKeyDown( SPACE, 0, false );
	} );

	it( 'horizontal: should navigate by left and right', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<NavigableMenu orientation="horizontal" onNavigate={ ( index ) => currentIndex = index }>
				<span tabIndex="-1" id="btn1">One</span>
				<span tabIndex="-1" id="btn2">Two</span>
				<span id="btn-deep-wrapper">
					<span id="btn-deep" tabIndex="-1">Deep</span>
				</span>
				<span tabIndex="-1" id="btn3">Three</span>
			</NavigableMenu>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div' );
		wrapper.getDOMNode().querySelector( '#btn1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode, false );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( RIGHT, 1, true );
		assertKeyDown( RIGHT, 2, true );
		assertKeyDown( RIGHT, 3, true );
		assertKeyDown( RIGHT, 0, true );
		assertKeyDown( LEFT, 3, true );
		assertKeyDown( LEFT, 2, true );
		assertKeyDown( LEFT, 1, true );
		assertKeyDown( LEFT, 0, true );
		assertKeyDown( UP, 0, false );
		assertKeyDown( DOWN, 0, false );
		assertKeyDown( SPACE, 0, false );
	} );

	it( 'horizontal: should navigate by left and right, and stop at edges', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<NavigableMenu cycle={ false } orientation="horizontal" onNavigate={ ( index ) => currentIndex = index }>
				<span tabIndex="-1" id="btn1">One</span>
				<span tabIndex="-1" id="btn2">Two</span>
				<span tabIndex="-1" id="btn3">Three</span>
			</NavigableMenu>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div' );
		wrapper.getDOMNode().querySelector( '#btn1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode, false );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( RIGHT, 1, true );
		assertKeyDown( RIGHT, 2, true );
		assertKeyDown( RIGHT, 2, true );
		assertKeyDown( LEFT, 1, true );
		assertKeyDown( LEFT, 0, true );
		assertKeyDown( LEFT, 0, true );
		assertKeyDown( DOWN, 0, false );
		assertKeyDown( UP, 0, false );
		assertKeyDown( SPACE, 0, false );
	} );

	it( 'both: should navigate by up/down and left/right', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<NavigableMenu orientation="both" onNavigate={ ( index ) => currentIndex = index }>
				<button id="btn1">One</button>
				<button id="btn2">Two</button>
				<button id="btn3">Three</button>
			</NavigableMenu>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div' );
		wrapper.getDOMNode().querySelector( '#btn1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( DOWN, 1, true );
		assertKeyDown( DOWN, 2, true );
		assertKeyDown( DOWN, 0, true );
		assertKeyDown( RIGHT, 1, true );
		assertKeyDown( RIGHT, 2, true );
		assertKeyDown( RIGHT, 0, true );
		assertKeyDown( UP, 2, true );
		assertKeyDown( UP, 1, true );
		assertKeyDown( UP, 0, true );
		assertKeyDown( LEFT, 2, true );
		assertKeyDown( LEFT, 1, true );
		assertKeyDown( LEFT, 0, true );
		assertKeyDown( SPACE, 0, false );
	} );
} );

describe( 'TabbableContainer', () => {
	it( 'should navigate by keypresses', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<TabbableContainer className="wrapper" onNavigate={ ( index ) => currentIndex = index }>
				<div className="section" id="section1" tabIndex="0">Section One</div>
				<div className="section" id="section2" tabIndex="0">Section Two</div>
				<div className="deep-section-wrapper">
					<div className="section" id="section-deep" tabIndex="0">Section to <strong>not</strong> skip</div>
				</div>
				<div className="section" id="section3" tabIndex="0">Section Three</div>
			</TabbableContainer>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div.wrapper' );
		wrapper.getDOMNode().querySelector( '#section1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, shiftKey, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode, shiftKey );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( TAB, false, 1, true );
		assertKeyDown( TAB, false, 2, true );
		assertKeyDown( TAB, false, 3, true );
		assertKeyDown( TAB, false, 0, true );
		assertKeyDown( TAB, true, 3, true );
		assertKeyDown( TAB, true, 2, true );
		assertKeyDown( TAB, true, 1, true );
		assertKeyDown( TAB, true, 0, true );
		assertKeyDown( SPACE, false, 0, false );
	} );

	it( 'should navigate by keypresses and stop at edges', () => {
		let currentIndex = 0;
		const wrapper = mount( (
			<TabbableContainer cycle={ false } className="wrapper" onNavigate={ ( index ) => currentIndex = index }>
				<div className="section" id="section1" tabIndex="0">Section One</div>
				<div className="section" id="section2" tabIndex="0">Section Two</div>
				<div className="section" id="section3" tabIndex="0">Section Three</div>
			</TabbableContainer>
		) );

		simulateVisible( wrapper, '*' );

		const container = wrapper.find( 'div.wrapper' );
		wrapper.getDOMNode().querySelector( '#section1' ).focus();

		// Navigate options
		function assertKeyDown( keyCode, shiftKey, expectedActiveIndex, expectedStop ) {
			const interaction = fireKeyDown( container, keyCode, shiftKey );
			expect( currentIndex ).toBe( expectedActiveIndex );
			expect( interaction.stopped ).toBe( expectedStop );
		}

		assertKeyDown( TAB, false, 1, true );
		assertKeyDown( TAB, false, 2, true );
		assertKeyDown( TAB, false, 2, true );
		assertKeyDown( TAB, true, 1, true );
		assertKeyDown( TAB, true, 0, true );
		assertKeyDown( TAB, true, 0, true );
		assertKeyDown( SPACE, false, 0, false );
	} );
} );
