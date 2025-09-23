/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ActivityEvent } from '../activity-event';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-config', () => jest.fn( () => '' ) );
jest.mock( '@wordpress/components', () => ( {
	__experimentalHStack: ( {
		children,
		className,
	}: {
		children: ReactNode;
		className?: string;
	} ) => <div className={ className }>{ children }</div>,
} ) );
jest.mock( '@wordpress/icons', () => ( {
	Icon: ( { icon }: { icon?: ReactNode } ) => <span>{ icon ?? null }</span>,
} ) );

describe( 'ActivityEvent', () => {
	it( 'renders the summary and plain content text', () => {
		render( <ActivityEvent summary="Summary" content={ { text: 'Plain content' } } /> );

		expect( screen.getByText( 'Summary' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Plain content' ) ).toBeInTheDocument();
	} );

	it( 'renders formatted content with links', () => {
		const content = {
			text: 'View post',
			ranges: [
				{
					id: 'range-1',
					indices: [ 0, 4 ] as [ number, number ],
					type: 'link',
					url: 'https://wordpress.com/post/example',
				},
			],
		};

		render( <ActivityEvent summary="Summary" content={ content } /> );

		const link = screen.getByRole( 'link', { name: 'View' } );
		expect( link ).toBeInTheDocument();
		expect( link.getAttribute( 'href' ) ).toBe( '/post/example' );
	} );
} );
