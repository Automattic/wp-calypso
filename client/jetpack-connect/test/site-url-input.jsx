/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';
import JetpackConnectSiteUrlInput from '../site-url-input';

const requiredProps = { translate: ( string ) => string };

describe( 'JetpackConnectSiteUrlInput', () => {
	test( 'Should render an error when URL is invalid', () => {
		const { container } = render(
			<JetpackConnectSiteUrlInput { ...requiredProps } url="invalid-url" />
		);
		const button = container.querySelector( '.jetpack-connect__connect-button' );

		act( () => {
			button.click();
		} );

		expect( container ).toHaveTextContent( 'Please enter a valid URL.' );
	} );

	test( 'Should not render an error when URL is valid and has protocol', () => {
		const { container } = render(
			<JetpackConnectSiteUrlInput
				{ ...requiredProps }
				url="http://valid.com"
				onSubmit={ () => {} }
			/>
		);
		const button = container.querySelector( '.jetpack-connect__connect-button' );

		act( () => {
			button.click();
		} );

		expect( container ).not.toHaveTextContent( 'Please enter a valid URL.' );
	} );

	test( 'Should not render an error when URL is valid and has no protocol', () => {
		const { container } = render(
			<JetpackConnectSiteUrlInput { ...requiredProps } url="valid.com" onSubmit={ () => {} } />
		);
		const button = container.querySelector( '.jetpack-connect__connect-button' );

		act( () => {
			button.click();
		} );

		expect( container ).not.toHaveTextContent( 'Please enter a valid URL.' );
	} );

	test( 'Should call onSubmit when URL is valid', () => {
		const onSubmit = jest.fn();
		const { container } = render(
			<JetpackConnectSiteUrlInput { ...requiredProps } url="valid.com" onSubmit={ onSubmit } />
		);
		const button = container.querySelector( '.jetpack-connect__connect-button' );

		act( () => {
			button.click();
		} );

		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );
} );
