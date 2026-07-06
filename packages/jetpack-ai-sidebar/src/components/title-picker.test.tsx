/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TitlePicker from './title-picker';

const mockEditPost = jest.fn();
let mockCurrentTitle: string | undefined;

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
						attr === 'title' ? mockCurrentTitle : undefined,
				};
			}
			return {};
		} ),
} ) );

describe( 'TitlePicker', () => {
	beforeEach( () => {
		mockEditPost.mockClear();
		mockCurrentTitle = undefined;
	} );

	const titles = [
		{ title: 'A Great Post Title', explanation: 'a' },
		{ title: 'Another Strong Title', explanation: 'b' },
	];

	it( 'renders every suggested title', () => {
		render( <TitlePicker titles={ titles } /> );
		expect( screen.getByText( titles[ 0 ].title ) ).toBeInTheDocument();
		expect( screen.getByText( titles[ 1 ].title ) ).toBeInTheDocument();
	} );

	it( 'writes the chosen title to the post title on click', () => {
		render( <TitlePicker titles={ titles } /> );
		fireEvent.click( screen.getByText( titles[ 0 ].title ) );
		expect( mockEditPost ).toHaveBeenCalledWith( { title: titles[ 0 ].title } );
	} );

	it( 'calls onComplete when an option is applied', () => {
		const onComplete = jest.fn();
		render( <TitlePicker titles={ titles } onComplete={ onComplete } /> );
		fireEvent.click( screen.getByText( titles[ 1 ].title ) );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'marks the option matching the current post title as applied on mount', () => {
		mockCurrentTitle = titles[ 1 ].title;
		render( <TitlePicker titles={ titles } /> );
		const applied = screen.getByText( titles[ 1 ].title ).closest( 'button' ) as HTMLButtonElement;
		expect( applied ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( 'Title updated.' ) ).toBeInTheDocument();
	} );
} );
