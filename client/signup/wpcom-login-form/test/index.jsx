/** @jest-environment jsdom */
import config from '@automattic/calypso-config';
import { render } from '@testing-library/react';
import WpcomLoginForm from '..';

jest.mock( '@automattic/calypso-config' );

describe( 'WpcomLoginForm', () => {
	const props = {
		log: 'log_text',
		pwd: 'secret',
		authorization: 'authorization_token',
		redirectTo: 'https://test.wordpress.com',
	};

	test( 'should render default fields as expected.', () => {
		const { container, rerender } = render( <WpcomLoginForm { ...props } /> );

		// should render root form element
		const form = container.firstChild;
		expect( form ).toBeVisible();
		expect( form ).toHaveAttribute( 'method', 'post' );
		expect( form ).toHaveAttribute( 'action', 'https://test.wordpress.com/wp-login.php' );

		// form should include default hidden elements
		expect( container.querySelector( 'input[name="log"]' ) ).toHaveValue( 'log_text' );
		expect( container.querySelector( 'input[name="pwd"]' ) ).toHaveValue( 'secret' );
		expect( container.querySelector( 'input[name="authorization"]' ) ).toHaveValue(
			'authorization_token'
		);
		expect( container.querySelector( 'input[name="redirect_to"]' ) ).toHaveValue(
			'https://test.wordpress.com'
		);

		// when update a prop
		rerender( <WpcomLoginForm { ...props } log="another_log" /> );
		const el = container.querySelector( 'input[name="log"]' );
		expect( el ).toHaveValue( 'another_log' );
	} );

	test( 'its action should be under the wpcom subdomain that `redirectTo` prop contains.', () => {
		const { container, rerender } = render(
			<WpcomLoginForm { ...props } redirectTo="https://foo.wordpress.com" />
		);

		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://foo.wordpress.com/wp-login.php'
		);

		rerender( <WpcomLoginForm { ...props } redirectTo="https://bar.wordpress.com" /> );
		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://bar.wordpress.com/wp-login.php'
		);
	} );

	test( 'its action should has no subdomain when `hostname` is wpcalypso.wpcom or horizon.wpcom.', () => {
		const myProps = { ...props, redirectTo: 'https://foo.wordpress.com' };
		const { container, rerender } = render( <WpcomLoginForm { ...myProps } /> );

		// should has the same hostname with redirectTo prop.
		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://foo.wordpress.com/wp-login.php'
		);

		// should be default url
		config.mockReturnValueOnce( 'wpcalypso.wordpress.com' );
		rerender( <WpcomLoginForm { ...myProps } /> );
		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://wordpress.com/wp-login.php'
		);

		// should has the same hostname with redirectTo prop.
		config.mockReturnValueOnce( 'bar.wordpress.com' );
		rerender( <WpcomLoginForm { ...myProps } /> );
		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://foo.wordpress.com/wp-login.php'
		);

		// should be default url
		config.mockReturnValueOnce( 'horizon.wordpress.com' );
		rerender( <WpcomLoginForm { ...myProps } /> );
		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://wordpress.com/wp-login.php'
		);
	} );

	test( 'its action should has no subdomain when `redirectTo` prop is not a subdomain of wpcom.', () => {
		const { container } = render(
			<WpcomLoginForm { ...props } redirectTo="https://wordpress.org" />
		);

		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://wordpress.com/wp-login.php'
		);
	} );

	test( 'its action should has no subdomain when `redirectTo` prop contains public-api.wordpress.com', () => {
		const { container } = render(
			<WpcomLoginForm { ...props } redirectTo="https://public-api.wordpress.com/" />
		);

		expect( container.firstChild ).toHaveAttribute(
			'action',
			'https://wordpress.com/wp-login.php'
		);
	} );
} );
