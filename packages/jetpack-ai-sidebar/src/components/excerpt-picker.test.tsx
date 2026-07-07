/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ExcerptPicker from './excerpt-picker';

const mockEditPost = jest.fn();
let mockCurrentExcerpt: string | undefined;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: ( store: string ) => {
		if ( store === 'core/editor' ) {
			return { editPost: mockEditPost };
		}
		return {};
	},
	useSelect: ( mapSelect: any ) =>
		mapSelect( ( store: string ) => {
			if ( store === 'core/editor' ) {
				return {
					getEditedPostAttribute: ( attr: string ) =>
						attr === 'excerpt' ? mockCurrentExcerpt : undefined,
				};
			}
			return {};
		} ),
} ) );

describe( 'ExcerptPicker', () => {
	beforeEach( () => {
		mockEditPost.mockClear();
		mockCurrentExcerpt = undefined;
	} );

	const excerpts = [
		{
			excerpt: 'A hands-on beginner guide to planning and planting a first vegetable garden.',
			explanation: 'a',
		},
		{
			excerpt: 'Learn the essentials of starting a vegetable garden, from soil to harvest.',
			explanation: 'b',
		},
	];

	it( 'renders every suggested excerpt', () => {
		render( <ExcerptPicker excerpts={ excerpts } /> );
		expect( screen.getByText( excerpts[ 0 ].excerpt ) ).toBeInTheDocument();
		expect( screen.getByText( excerpts[ 1 ].excerpt ) ).toBeInTheDocument();
	} );

	it( 'writes the chosen excerpt to the post on click', () => {
		render( <ExcerptPicker excerpts={ excerpts } /> );
		fireEvent.click( screen.getByText( excerpts[ 0 ].excerpt ) );
		expect( mockEditPost ).toHaveBeenCalledWith( { excerpt: excerpts[ 0 ].excerpt } );
	} );

	it( 'highlights the applied option and calls onComplete', () => {
		const onComplete = jest.fn();
		render( <ExcerptPicker excerpts={ excerpts } onComplete={ onComplete } /> );
		const button = screen
			.getByText( excerpts[ 1 ].excerpt )
			.closest( 'button' ) as HTMLButtonElement;
		fireEvent.click( button );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders no options without crashing when the excerpts prop is malformed', () => {
		render( <ExcerptPicker excerpts={ undefined as any } /> );
		expect( document.querySelectorAll( 'button' ) ).toHaveLength( 0 );

		render( <ExcerptPicker excerpts={ 'not-an-array' as any } /> );
		expect( document.querySelectorAll( 'button' ) ).toHaveLength( 0 );
	} );

	it( 'marks the option matching the current post excerpt as applied on mount', () => {
		mockCurrentExcerpt = excerpts[ 0 ].excerpt;
		render( <ExcerptPicker excerpts={ excerpts } /> );
		const applied = screen
			.getByText( excerpts[ 0 ].excerpt )
			.closest( 'button' ) as HTMLButtonElement;
		expect( applied ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( 'Excerpt updated.' ) ).toBeInTheDocument();
	} );
} );
