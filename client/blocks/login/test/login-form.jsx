/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import FormsButton from 'calypso/components/forms/form-button';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';

const noop = () => {};

describe( 'LoginForm', () => {
	let LoginForm;

	beforeAll( () => {
		LoginForm = require( 'calypso/blocks/login/login-form' ).LoginForm;
	} );

	describe( 'component rendering', () => {
		test( 'displays a login form', () => {
			const wrapper = shallow(
				<LoginForm translate={ noop } socialAccountLink={ { isLinking: false } } />
			);
			expect( wrapper.find( FormTextInput ).length ).toEqual( 1 );
			expect( wrapper.find( FormPasswordInput ).length ).toEqual( 1 );
			expect( wrapper.find( FormsButton ).length ).toEqual( 1 );
		} );
	} );
} );
