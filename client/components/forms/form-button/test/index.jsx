/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import FormButton from '../';

describe( 'FormButton', () => {
	test( 'exposes the rendered button element', () => {
		const buttonRef = createRef();

		render( <FormButton ref={ buttonRef }>Actions</FormButton> );

		expect( buttonRef.current.getDOMNode() ).toBe(
			screen.getByRole( 'button', { name: 'Actions' } )
		);
	} );

	test( 'exposes the rendered link element', () => {
		const linkRef = createRef();

		render(
			<FormButton ref={ linkRef } href="/backup/example.com">
				Open backup
			</FormButton>
		);

		expect( linkRef.current.getDOMNode() ).toBe(
			screen.getByRole( 'link', { name: 'Open backup' } )
		);
	} );
} );
