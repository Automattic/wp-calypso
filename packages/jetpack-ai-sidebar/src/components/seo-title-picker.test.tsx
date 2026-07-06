/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SeoTitlePicker from './seo-title-picker';

const mockEditPost = jest.fn();
let mockCurrentMeta: Record< string, string > | undefined;

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
						attr === 'meta' ? mockCurrentMeta : undefined,
				};
			}
			return {};
		} ),
} ) );

describe( 'SeoTitlePicker', () => {
	beforeEach( () => {
		mockEditPost.mockClear();
		mockCurrentMeta = undefined;
	} );

	const titles = [
		{ title: 'Best Vegetable Garden Guide for Beginners', explanation: 'a' },
		{ title: 'Start a Vegetable Garden: Easy Beginner Steps', explanation: 'b' },
	];

	it( 'renders every suggested SEO title', () => {
		render( <SeoTitlePicker titles={ titles } /> );
		expect( screen.getByText( titles[ 0 ].title ) ).toBeInTheDocument();
		expect( screen.getByText( titles[ 1 ].title ) ).toBeInTheDocument();
	} );

	it( 'writes the chosen title to the jetpack_seo_html_title meta on click', () => {
		render( <SeoTitlePicker titles={ titles } /> );
		fireEvent.click( screen.getByText( titles[ 0 ].title ) );
		expect( mockEditPost ).toHaveBeenCalledWith( {
			meta: { jetpack_seo_html_title: titles[ 0 ].title },
		} );
	} );

	it( 'highlights the applied option and calls onComplete', () => {
		const onComplete = jest.fn();
		render( <SeoTitlePicker titles={ titles } onComplete={ onComplete } /> );
		const button = screen.getByText( titles[ 1 ].title ).closest( 'button' ) as HTMLButtonElement;
		fireEvent.click( button );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'marks the option matching the current SEO title meta as applied on mount', () => {
		mockCurrentMeta = { jetpack_seo_html_title: titles[ 0 ].title };
		render( <SeoTitlePicker titles={ titles } /> );
		const applied = screen.getByText( titles[ 0 ].title ).closest( 'button' ) as HTMLButtonElement;
		expect( applied ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( 'SEO title updated.' ) ).toBeInTheDocument();
	} );
} );
