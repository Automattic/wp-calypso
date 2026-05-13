/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import SocialConnectWidget from '../index';

describe( 'SocialConnectWidget', () => {
	test( 'renders the Google service icon', () => {
		const { container } = render( <SocialConnectWidget service="google" /> );

		expect( container.querySelector( '.social-icons__google' ) ).toBeInTheDocument();
	} );

	test( 'renders the dotted connector', () => {
		const { container } = render( <SocialConnectWidget service="apple" /> );

		expect( container.querySelector( '.auth-social-connect-widget__dots' ) ).toBeInTheDocument();
	} );

	test( 'renders the WordPress logo', () => {
		const { container } = render( <SocialConnectWidget service="google" /> );

		expect( container.querySelector( '.auth-social-connect-widget__wp-logo' ) ).toBeInTheDocument();
	} );
} );
