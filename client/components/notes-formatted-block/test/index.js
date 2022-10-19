/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormattedBlock, { FormattedBlockRenderer } from '..';

describe( 'FormattedBlock', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'renders string content as-is', () => {
		const content = 'my content';

		render( <FormattedBlock content={ content } /> );

		const block = screen.getByText( content );

		expect( block ).toBeInTheDocument();

		// Test it's rendered as a raw string
		expect( block.innerHTML ).toEqual( content );
	} );

	test( 'renders string content without using a custom block if content type is undefined', () => {
		const MockBlockMapping = FormattedBlockRenderer( {
			myBlock: ( props ) => <div { ...props }>MyFakeBlock</div>,
		} );

		const children = [
			'example1',
			{
				text: 'main',
			},
			{
				children: [ 'children1', 'children2' ],
			},
		];

		render( <MockBlockMapping content={ { children } } meta={ {} } /> );

		const customBlock = screen.queryByText( 'MyFakeBlock' );
		const block = screen.getByText( /example1/ );

		expect( customBlock ).not.toBeInTheDocument();

		expect( block ).toBeInTheDocument();
		expect( block ).toHaveTextContent( 'main' );
		expect( block ).toHaveTextContent( 'children1' );
		expect( block ).toHaveTextContent( 'children2' );
	} );

	test( 'handles a click if `onClick` prop is passed', async () => {
		userEvent.setup();

		const MockBlockMapping = FormattedBlockRenderer( {
			myBlock: ( props ) => <div { ...props }>MyFakeBlock</div>,
		} );

		const content = { type: 'myBlock', children: [ 'children1', 'children2' ] };

		const onClick = jest.fn();

		render( <MockBlockMapping content={ content } onClick={ onClick } /> );

		await userEvent.click( screen.getByText( /MyFakeBlock/ ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders the correct block if the content type is supported', () => {
		const MockBlockMapping = FormattedBlockRenderer( {
			myBlock: ( props ) => (
				<div { ...props }>
					MyFakeBlock
					{ props.children }
				</div>
			),
		} );

		const content = { type: 'myBlock', children: [ 'children1', 'children2' ] };

		render( <MockBlockMapping content={ content } meta={ {} } /> );

		const block = screen.getByText( /MyFakeBlock/ );

		expect( block ).toBeInTheDocument();
		expect( block ).toHaveTextContent( 'children1' );
		expect( block ).toHaveTextContent( 'children2' );
	} );
} );
