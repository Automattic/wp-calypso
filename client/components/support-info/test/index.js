/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import SupportInfo from '../';

describe( 'SupportInfo', () => {
	const testProps = {
		text: 'Hello world!',
		link: 'https://foo.com/',
		privacyLink: 'https://foo.com/privacy/',
	};

	test( 'should have a proper "Learn more" link', () => {
		render( <SupportInfo { ...testProps } /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		const link = screen.getByRole( 'link', { name: /learn more/i } );

		expect( link ).toBeInTheDocument();
		expect( link ).toHaveAttribute( 'href', testProps.link );
	} );

	it( 'should have a proper "Privacy Information" link', () => {
		render( <SupportInfo { ...testProps } /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		const link = screen.getByRole( 'link', { name: /privacy information/i } );

		expect( link ).toBeInTheDocument();
		expect( link ).toHaveAttribute( 'href', testProps.privacyLink );
	} );
} );
