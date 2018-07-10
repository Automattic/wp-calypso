/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Dashicon from '../';

describe( 'Dashicon', () => {
	describe( 'basic rendering', () => {
		it( 'should render an empty null element when icon is not provided', () => {
			const dashicon = shallow( <Dashicon /> );
			// Unrendered element.
			expect( dashicon.type() ).toBeNull();
		} );

		it( 'should render an empty null element when a non dashicon is provided', () => {
			const dashicon = shallow( <Dashicon icon="zomg-never-gonna-be-an-icon-icon" /> );
			// Unrendered element.
			expect( dashicon.type() ).toBeNull();
		} );

		it( 'should render a SVG icon element when a matching icon is provided', () => {
			const dashicon = shallow( <Dashicon icon="wordpress" /> );
			expect( dashicon.hasClass( 'dashicon' ) ).toBe( true );
			expect( dashicon.hasClass( 'dashicons-wordpress' ) ).toBe( true );
			expect( dashicon.type() ).toBe( 'svg' );
			expect( dashicon.prop( 'xmlns' ) ).toBe( 'http://www.w3.org/2000/svg' );
			expect( dashicon.prop( 'width' ) ).toBe( 20 );
			expect( dashicon.prop( 'height' ) ).toBe( 20 );
			expect( dashicon.prop( 'viewBox' ) ).toBe( '0 0 20 20' );
		} );

		it( 'should render an additional class to the SVG element', () => {
			const dashicon = shallow( <Dashicon icon="wordpress" className="capital-p-dangit" /> );
			expect( dashicon.hasClass( 'capital-p-dangit' ) ).toBe( true );
		} );
	} );
} );
