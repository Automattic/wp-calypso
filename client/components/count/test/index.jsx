import { shallow } from 'enzyme';
import { Count } from '../';

describe( 'Count', () => {
	test( 'should use the correct class name', () => {
		const count = shallow( <Count count={ 23 } numberFormat={ ( string ) => string } /> );
		expect( count.hasClass( 'count' ) ).toBe( true );
	} );

	test( 'should call provided as prop numberFormat function', () => {
		const numberFormatSpy = jest.fn();
		shallow( <Count count={ 23 } numberFormat={ numberFormatSpy } /> );
		expect( numberFormatSpy ).toHaveBeenCalledWith( 23 );
	} );
} );
