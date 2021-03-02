/**
 * External dependencies
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import Search from '..';

describe( 'search', () => {
	it( 'should return a ref with focus', () => {
		const ref = React.createRef();
		render( <Search ref={ ref } /> );
		const searchBox = screen.getByRole( 'searchbox' );
		expect( document.activeElement ).not.toBe( searchBox );

		act( () => {
			ref.focus();
		} );

		expect( document.activeElement ).toBe( searchBox );
	} );
} );
