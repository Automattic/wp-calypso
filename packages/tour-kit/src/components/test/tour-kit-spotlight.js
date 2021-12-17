/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import usePopperHandler from '../../hooks/use-popper-handler';
import TourKitOverlay from '../tour-kit-overlay';
import TourKitSpotlight from '../tour-kit-spotlight';

jest.mock( '../../hooks/use-popper-handler' );
jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
	useMemo: jest.fn( () => 'modifier' ),
} ) );

describe( 'TourKitSpotlight', () => {
	beforeEach( () => {
		usePopperHandler.mockImplementation( () => {
			return {
				styles: {
					popper: 'test-popper',
				},
				attributes: {},
			};
		} );
	} );

	test( 'should render', () => {
		const wrapper = shallow( <TourKitSpotlight /> );
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.children() ).toHaveLength( 2 );
	} );

	describe( 'Overlay', () => {
		test( 'should render Overlay visible when referenceElement is not set', () => {
			const wrapper = shallow( <TourKitSpotlight /> );
			expect( wrapper.find( TourKitOverlay ).prop( 'visible' ) ).toBe( true );
		} );

		test( 'should render Overlay not visible when referenceElement is set', () => {
			const wrapper = shallow( <TourKitSpotlight referenceElement={ <div /> } /> );
			expect( wrapper.find( TourKitOverlay ).prop( 'visible' ) ).toBe( false );
		} );
	} );

	describe( 'Spotlight', () => {
		test( 'should render', () => {
			const wrapper = shallow( <TourKitSpotlight referenceElement={ <div /> } /> );
			expect( wrapper ).toMatchSnapshot();
		} );

		test( 'should call usePopperHandler with correct props', () => {
			const referenceElement = <div />;
			shallow( <TourKitSpotlight referenceElement={ referenceElement } /> );
			expect( usePopperHandler ).toHaveBeenCalled();
			expect( usePopperHandler ).toHaveBeenCalledWith( referenceElement, null, [ 'modifier' ] );
		} );

		test( 'should have correct class and style if referenceElement is not present', () => {
			const wrapper = shallow( <TourKitSpotlight /> );
			const spotlightDiv = wrapper.childAt( 1 );
			expect( spotlightDiv.hasClass( 'tour-kit-spotlight' ) ).toBe( true );
			expect( spotlightDiv.hasClass( '--visible' ) ).toBe( false );
			expect( spotlightDiv.prop( 'style' ) ).toBeUndefined();
		} );

		test( 'should have correct class and style if referenceElement is present', () => {
			const wrapper = shallow( <TourKitSpotlight referenceElement={ <div /> } /> );
			const spotlightDiv = wrapper.childAt( 1 );
			expect( spotlightDiv.hasClass( 'tour-kit-spotlight' ) ).toBe( true );
			expect( spotlightDiv.hasClass( '--visible' ) ).toBe( true );
			expect( spotlightDiv.prop( 'style' ) ).toEqual( 'test-popper' );
		} );
	} );
} );
