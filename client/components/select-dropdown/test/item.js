/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import SelectDropdownItem from '../item';

describe( 'item', () => {
	describe( 'component rendering', () => {
		test( 'should render a list entry', () => {
			const dropdownItem = shallow( <SelectDropdownItem>Published</SelectDropdownItem> );
			expect( dropdownItem.is( 'li.select-dropdown__option' ) ).toBe( true );
		} );

		test( 'should contain a link', () => {
			const dropdownItem = shallow( <SelectDropdownItem>Published</SelectDropdownItem> );
			expect( dropdownItem.children( 'a.select-dropdown__item' ).length ).toEqual( 1 );
			expect( dropdownItem.find( 'span.select-dropdown__item-text' ).text() ).toEqual(
				'Published'
			);
		} );
	} );

	describe( 'when the component is clicked', () => {
		test( 'should do nothing when is disabled', () => {
			const onClickSpy = jest.fn();
			const dropdownItem = shallow(
				<SelectDropdownItem disabled={ true } onClick={ onClickSpy }>
					Published
				</SelectDropdownItem>
			);

			const link = dropdownItem.children( 'a.select-dropdown__item' );
			expect( link.hasClass( 'is-disabled' ) ).toBe( true );

			link.simulate( 'click' );
			expect( onClickSpy ).not.toHaveBeenCalled();
		} );

		test( 'should run the `onClick` hook', () => {
			const onClickSpy = jest.fn();
			const dropdownItem = shallow(
				<SelectDropdownItem onClick={ onClickSpy }>Published</SelectDropdownItem>
			);
			dropdownItem.children( 'a.select-dropdown__item' ).simulate( 'click' );
			expect( onClickSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
