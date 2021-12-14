/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import TourKitOverlay from '../tour-kit-overlay';

describe( 'TourKitOverlay', () => {
	test( 'should render', () => {
		const wrapper = shallow( <TourKitOverlay /> );

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.type() ).toBe( 'div' );
	} );

	test( 'should render only with class tour-kit-overlay when visible var not passed', () => {
		const wrapper = shallow( <TourKitOverlay /> );

		expect( wrapper.hasClass( 'tour-kit-overlay' ) ).toBe( true );
		expect( wrapper.hasClass( '--visible' ) ).toBe( false );
	} );

	test( 'should render only with class tour-kit-overlay if visible var is false', () => {
		const wrapper = shallow( <TourKitOverlay visible={ false } /> );

		expect( wrapper.hasClass( 'tour-kit-overlay' ) ).toBe( true );
		expect( wrapper.hasClass( '--visible' ) ).toBe( false );
	} );

	test( 'should render also with class visible if visible var is true', () => {
		const wrapper = shallow( <TourKitOverlay visible={ true } /> );

		expect( wrapper.hasClass( 'tour-kit-overlay' ) ).toBe( true );
		expect( wrapper.hasClass( '--visible' ) ).toBe( true );
	} );
} );
