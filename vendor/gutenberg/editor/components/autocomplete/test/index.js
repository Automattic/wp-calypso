/**
 * External dependencies
 */
import { mount, shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { addFilter, removeFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { withFilteredAutocompleters } from '..';

function TestComponent() {
	// Use a naturally focusable element because we will test with focus.
	return <input />;
}
const FilteredComponent = withFilteredAutocompleters( TestComponent );

describe( 'Autocomplete', () => {
	let wrapper = null;

	afterEach( () => {
		removeFilter( 'editor.Autocomplete.completers', 'test/autocompleters-hook' );

		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'filters supplied completers when next focused', () => {
		const completersFilter = jest.fn();
		addFilter(
			'editor.Autocomplete.completers',
			'test/autocompleters-hook',
			completersFilter
		);

		const expectedCompleters = [ {}, {}, {} ];
		wrapper = mount( <FilteredComponent completers={ expectedCompleters } blockName="core/foo" /> );

		expect( completersFilter ).not.toHaveBeenCalled();
		wrapper.find( 'input' ).simulate( 'focus' );
		expect( completersFilter ).toHaveBeenCalledWith( expectedCompleters, 'core/foo' );
	} );

	it( 'filters completers supplied when already focused', () => {
		wrapper = mount( <FilteredComponent completers={ [] } blockName="core/foo" /> );

		wrapper.find( 'input' ).getDOMNode().focus();
		expect( wrapper.getDOMNode().contains( document.activeElement ) ).toBeTruthy();

		const completersFilter = jest.fn();
		addFilter(
			'editor.Autocomplete.completers',
			'test/autocompleters-hook',
			completersFilter
		);

		const expectedCompleters = [ {}, {}, {} ];

		expect( completersFilter ).not.toHaveBeenCalled();
		wrapper.setProps( { completers: expectedCompleters } );
		expect( completersFilter ).toHaveBeenCalledWith( expectedCompleters, 'core/foo' );
	} );

	it( 'provides copies of completers to filter', () => {
		const completersFilter = jest.fn();
		addFilter(
			'editor.Autocomplete.completers',
			'test/autocompleters-hook',
			completersFilter
		);

		const specifiedCompleters = [ {}, {}, {} ];
		wrapper = mount( <FilteredComponent completers={ specifiedCompleters } /> );

		expect( completersFilter ).not.toHaveBeenCalled();
		wrapper.find( 'input' ).simulate( 'focus' );
		expect( completersFilter ).toHaveBeenCalledTimes( 1 );

		const [ actualCompleters ] = completersFilter.mock.calls[ 0 ];
		expect( actualCompleters ).not.toBe( specifiedCompleters );
		expect( actualCompleters ).toEqual( specifiedCompleters );
	} );

	it( 'supplies filtered completers to inner component', () => {
		const expectedFilteredCompleters = [ {}, {} ];
		const completersFilter = jest.fn( () => expectedFilteredCompleters );
		addFilter(
			'editor.Autocomplete.completers',
			'test/autocompleters-hook',
			completersFilter
		);

		wrapper = mount( <FilteredComponent /> );

		wrapper.find( 'input' ).simulate( 'focus' );

		const filteredComponentWrapper = wrapper.childAt( 0 );
		const innerComponentWrapper = filteredComponentWrapper.childAt( 0 );
		expect( innerComponentWrapper.name() ).toBe( 'TestComponent' );
		expect( innerComponentWrapper.prop( 'completers' ) ).toEqual( expectedFilteredCompleters );
	} );

	it( 'passes props to inner component', () => {
		const expectedProps = {
			expected1: 1,
			expected2: 'two',
			expected3: '🌳',
		};

		wrapper = shallow( <FilteredComponent { ...expectedProps } /> );

		const innerComponentWrapper = wrapper.childAt( 0 );
		expect( innerComponentWrapper.name() ).toBe( 'TestComponent' );
		expect( innerComponentWrapper.props() ).toMatchObject( expectedProps );
	} );
} );
