/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import TourKitOverlay from '../tour-kit-overlay';
import TourKitSpotlight from '../tour-kit-spotlight';

describe( 'TourKitSpotlight', () => {
	test( 'should render', () => {
		const wrapper = shallow( <TourKitSpotlight /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render Overlay visible when no referenceElement', () => {
		const wrapper = shallow( <TourKitSpotlight /> );
		const overlay = wrapper.find( TourKitOverlay );
		expect( overlay.prop( 'visible' ) ).toBe( true );
	} );
} );
