/**
 * External dependencies
 */
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import Dropdown from '../';

describe( 'Dropdown', () => {
	const expectPopoverVisible = ( wrapper, visible ) => expect( wrapper.find( 'Popover' ) ).toHaveLength( visible ? 1 : 0 );

	it( 'should toggle the dropdown properly', () => {
		const expectButtonExpanded = ( wrapper, expanded ) => {
			expect( wrapper.find( 'button' ) ).toHaveLength( 1 );
			expect( wrapper.find( 'button' ) ).toHaveProp( 'aria-expanded', expanded );
		};
		const wrapper = mount( <Dropdown
			className="container"
			contentClassName="content"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button aria-expanded={ isOpen } onClick={ onToggle }>Toggleee</button>
			) }
			renderContent={ () => null }
		/> );

		expectButtonExpanded( wrapper, false );
		expectPopoverVisible( wrapper, false );

		wrapper.find( 'button' ).simulate( 'click' );
		wrapper.update();

		expectButtonExpanded( wrapper, true );
		expectPopoverVisible( wrapper, true );
	} );

	it( 'should close the dropdown when calling onClose', () => {
		const wrapper = mount( <Dropdown
			className="container"
			contentClassName="content"
			renderToggle={ ( { isOpen, onToggle, onClose } ) => [
				<button key="open" className="open" aria-expanded={ isOpen } onClick={ onToggle }>Toggleee</button>,
				<button key="close" className="close" onClick={ onClose } >closee</button>,
			] }
			renderContent={ () => null }
		/> );

		expectPopoverVisible( wrapper, false );

		wrapper.find( '.open' ).simulate( 'click' );
		wrapper.update();

		expectPopoverVisible( wrapper, true );

		wrapper.find( '.close' ).simulate( 'click' );
		wrapper.update();

		expectPopoverVisible( wrapper, false );
	} );
} );
