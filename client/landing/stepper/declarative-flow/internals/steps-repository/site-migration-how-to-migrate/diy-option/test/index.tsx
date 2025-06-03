/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DIYOption } from '..';

const onClick = jest.fn();

describe( 'DIYOption', () => {
	it( 'should render the DIY link', () => {
		render( <DIYOption onClick={ onClick } /> );

		expect( screen.queryByText( /I'll do it myself/ ) ).toBeInTheDocument();
	} );
} );
