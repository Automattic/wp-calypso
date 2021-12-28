/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import KeyboardNavigation from '../keyboard-navigation';
import TourKitFrame from '../tour-kit-frame';

const defaultConfig = {
	steps: [
		{
			referenceElements: null,
		},
	],
	renderers: {
		tourStep: jest.fn( () => <div className="test__tour" /> ),
		tourMinimized: jest.fn( () => <div className="test__minimized" /> ),
	},
	closeHandler: jest.fn( () => {} ),
	options: {
		className: 'optional-classname',
		effects: {
			overlay: false,
		},
	},
};

describe( 'TourKitFrame', () => {
	test( 'should render', () => {
		const wrapper = shallow( <TourKitFrame config={ defaultConfig } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should have right classNames', () => {
		const wrapper = shallow( <TourKitFrame config={ defaultConfig } /> );
		expect( wrapper.find( '.tour-kit-frame' ) ).toHaveLength( 1 );
		expect( wrapper.find( '.tour-kit-frame' ).hasClass( 'optional-classname' ) ).toEqual( true );
	} );

	test( 'should have keyboard navigation', () => {
		const wrapper = shallow( <TourKitFrame config={ defaultConfig } /> );
		expect( wrapper.find( KeyboardNavigation ) ).toHaveLength( 1 );
	} );

	test( 'should render right renderer', () => {
		const wrapper = shallow( <TourKitFrame config={ defaultConfig } /> );
		const stepRenderer = wrapper.find( '.test__tour' );
		expect( stepRenderer ).toHaveLength( 1 );
		expect( defaultConfig.renderers.tourStep ).toHaveBeenCalled();
		expect( wrapper.find( '.test__minimized' ) ).toHaveLength( 0 );

		const minimizeFunction = wrapper.find( KeyboardNavigation ).prop( 'onMinimize' );
		minimizeFunction();

		const minimizedRenderer = wrapper.find( '.test__minimized' );
		expect( minimizedRenderer ).toHaveLength( 1 );
		expect( wrapper.find( '.test__tour' ) ).toHaveLength( 0 );
	} );
} );
