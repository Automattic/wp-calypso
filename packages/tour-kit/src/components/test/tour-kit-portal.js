/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import TourKitFrame from '../tour-kit-frame';
import TourKitPortal from '../tour-kit-portal';

describe( 'TourKitPortal', () => {
	test( 'should render', () => {
		const wrapper = shallow( <TourKitPortal /> );
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.type() ).toEqual( 'div' );
	} );

	test( 'should have TourKitFrame with config', () => {
		const testConfig = {
			foo: 'bar',
		};

		const wrapper = shallow( <TourKitPortal config={ testConfig } /> );
		expect( wrapper.find( TourKitFrame ) ).toHaveLength( 1 );
		expect( wrapper.find( TourKitFrame ).prop( 'config' ) ).toEqual( testConfig );
	} );
} );
