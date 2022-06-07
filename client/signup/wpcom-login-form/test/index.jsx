import config from '@automattic/calypso-config';
import { shallow } from 'enzyme';
import WpcomLoginForm from '..';
jest.mock( '@automattic/calypso-config', () => jest.fn().mockReturnValueOnce( 'wordpress.com' ) );

describe( 'WpcomLoginForm', () => {
	const props = {
		log: 'log_text',
		pwd: 'secret',
		authorization: 'authorization_token',
		redirectTo: 'https://test.wordpress.com',
	};

	test( 'should render default fields as expected.', () => {
		const wrapper = shallow( <WpcomLoginForm { ...props } />, { disableLifecycleMethods: true } );

		// should render root form element
		const form = wrapper.find( 'form' );
		expect( form ).toHaveLength( 1 );
		expect( form.prop( 'method' ) ).toEqual( 'post' );
		expect( form.prop( 'action' ) ).toEqual( 'https://test.wordpress.com/wp-login.php' );

		// form should include default hidden elements
		expect( wrapper.find( 'form > input[type="hidden"]' ) ).toHaveLength( 4 );
		expect( wrapper.find( 'form > input[name="log"]' ).prop( 'value' ) ).toEqual( 'log_text' );
		expect( wrapper.find( 'form > input[name="pwd"]' ).prop( 'value' ) ).toEqual( 'secret' );
		expect( wrapper.find( 'form > input[name="authorization"]' ).prop( 'value' ) ).toEqual(
			'authorization_token'
		);
		expect( wrapper.find( 'form > input[name="redirect_to"]' ).prop( 'value' ) ).toEqual(
			'https://test.wordpress.com'
		);

		// when update a prop
		wrapper.setProps( { log: 'another_log' } );
		expect( wrapper.find( 'form > input[name="log"]' ).prop( 'value' ) ).toEqual( 'another_log' );
	} );

	test( 'should render extra fields if extraFields prop is passed.', () => {
		const wrapper = shallow(
			<WpcomLoginForm
				{ ...props }
				extraFields={ {
					foo: 'bar',
					lorem: 'ipsum',
				} }
			/>,
			{ disableLifecycleMethods: true }
		);

		expect( wrapper.find( 'input[type="hidden"]' ) ).toHaveLength( 6 );
		expect( wrapper.find( 'input[name="foo"]' ).prop( 'value' ) ).toEqual( 'bar' );
		expect( wrapper.find( 'input[name="lorem"]' ).prop( 'value' ) ).toEqual( 'ipsum' );
	} );

	test( 'its action should be under the wpcom subdomain that `redirectTo` prop contains.', () => {
		const wrapper = shallow(
			<WpcomLoginForm { ...props } redirectTo="https://foo.wordpress.com" />,
			{ disableLifecycleMethods: true }
		);

		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://foo.wordpress.com/wp-login.php'
		);

		wrapper.setProps( { redirectTo: 'https://bar.wordpress.com' } );
		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://bar.wordpress.com/wp-login.php'
		);
	} );

	test( 'its action should has no subdomain when `hostname` is wpcalypso.wpcom or horizon.wpcom.', () => {
		const wrapper = shallow(
			<WpcomLoginForm { ...props } redirectTo="https://foo.wordpress.com" />,
			{ disableLifecycleMethods: true }
		);

		// should has the same hostname with redirectTo prop.
		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://foo.wordpress.com/wp-login.php'
		);

		// should be default url
		config.mockReturnValueOnce( 'wpcalypso.wordpress.com' );
		wrapper.setProps( { log: 'wpcalpso' } ); // to update form action
		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://wordpress.com/wp-login.php'
		);

		// should has the same hostname with redirectTo prop.
		config.mockReturnValueOnce( 'bar.wordpress.com' );
		wrapper.setProps( { log: 'bar' } ); // to update form action
		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://foo.wordpress.com/wp-login.php'
		);

		// should be default url
		config.mockReturnValueOnce( 'horizon.wordpress.com' );
		config.mockReturnValueOnce( 'horizon.wordpress.com' );
		wrapper.setProps( { log: 'horizon' } ); // to update form action
		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://wordpress.com/wp-login.php'
		);
	} );

	test( 'its action should has no subdomain when `redirectTo` prop is not a subdomain of wpcom.', () => {
		const wrapper = shallow( <WpcomLoginForm { ...props } redirectTo="https://wordpress.org" />, {
			disableLifecycleMethods: true,
		} );

		expect( wrapper.find( 'form' ).prop( 'action' ) ).toEqual(
			'https://wordpress.com/wp-login.php'
		);
	} );
} );
