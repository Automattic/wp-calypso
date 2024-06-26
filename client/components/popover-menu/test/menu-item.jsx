/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

describe( 'PopoverMenuItem', () => {
	test( 'should be a button by default', () => {
		const { container } = render( <PopoverMenuItem /> );
		expect( container.firstChild.tagName ).toEqual( 'BUTTON' );
	} );

	test( 'should be a div if the itemComponent prop is provided', () => {
		const { container } = render( <PopoverMenuItem itemComponent="div" /> );
		expect( container.firstChild.tagName ).toEqual( 'DIV' );
	} );

	test( 'should be a link if the href prop is set', () => {
		const { container } = render( <PopoverMenuItem href="xyz" /> );
		expect( container.firstChild.tagName ).toEqual( 'A' );
	} );

	test( 'should be an ExternalLink if the isExternalLink prop is true and the href prop is set', () => {
		const { container } = render( <PopoverMenuItem isExternalLink href="xyz" /> );
		expect( container.firstChild.tagName ).toEqual( 'A' );
		expect( container.firstChild.getAttribute( 'target' ) ).toEqual( '_blank' );
	} );
} );
