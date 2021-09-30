import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import { Count } from '../';

describe( 'Count', () => {
	test( 'should use the correct class name', () => {
		const count = shallow( <Count count={ 23 } numberFormat={ ( string ) => string } /> );
		expect( count.hasClass( 'count' ) ).to.equal( true );
	} );

	test( 'should call provided as prop numberFormat function', () => {
		const numberFormatSpy = spy();
		shallow( <Count count={ 23 } numberFormat={ numberFormatSpy } /> );
		expect( numberFormatSpy ).to.have.been.calledWith( 23 );
	} );
} );
