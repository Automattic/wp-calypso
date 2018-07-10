/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import PanelRow from '../row';

describe( 'PanelRow', () => {
	it( 'should defined default class name', () => {
		const wrapper = shallow( <PanelRow /> );
		expect( wrapper.hasClass( 'components-panel__row' ) ).toBe( true );
	} );
	it( 'should defined custom class name', () => {
		const wrapper = shallow( <PanelRow className="custom" /> );
		expect( wrapper.hasClass( 'custom' ) ).toBe( true );
	} );
	it( 'should return child components', () => {
		const wrapper = shallow( <PanelRow><p>children</p></PanelRow> );
		expect( wrapper.find( 'p' ).text() ).toBe( 'children' );
	} );
} );
