import { shallow } from 'enzyme';
import ValidationFieldset from '..';

describe( 'ValidationFieldset', () => {
	test( 'should pass className prop to the child FormFieldset component.', () => {
		const wrapper = shallow( <ValidationFieldset className="test__foo-bar" /> );

		expect( wrapper.find( 'FormFieldset' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'FormFieldset' ).hasClass( 'test__foo-bar' ) ).toBe( true );
	} );

	test( 'should include a FormInputValidation only when errorMessages prop is set.', () => {
		const wrapper = shallow( <ValidationFieldset /> );

		expect( wrapper.find( 'FormInputValidation' ).exists() ).toBe( false );

		wrapper.setProps( { errorMessages: [ 'error', 'message' ] } );
		expect( wrapper.find( 'FormInputValidation' ) ).toHaveLength( 1 );

		expect( wrapper.find( 'FormInputValidation' ).prop( 'text' ) ).toEqual( 'error' );

		expect( wrapper.find( '.validation-fieldset__validation-message' ).exists() ).toBe( true );
	} );

	test( 'should render the children within a FormFieldset', () => {
		const wrapper = shallow(
			<ValidationFieldset>
				<p>Lorem ipsum dolor sit amet</p>
				<p>consectetur adipiscing elit</p>
			</ValidationFieldset>
		);

		expect( wrapper.find( 'FormFieldset > p' ) ).toHaveLength( 2 );
		expect( wrapper.find( 'FormFieldset > p' ).first().text() ).toEqual(
			'Lorem ipsum dolor sit amet'
		);
	} );
} );
