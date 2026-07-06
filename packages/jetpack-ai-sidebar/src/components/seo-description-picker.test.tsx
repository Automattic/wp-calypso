/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SeoDescriptionPicker from './seo-description-picker';

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

describe( 'SeoDescriptionPicker', () => {
	beforeEach( () => {
		mockEditPost.mockClear();
		mockCurrentMeta = undefined;
	} );

	const descriptions = [
		{
			description: 'Learn how to start a vegetable garden with easy beginner steps.',
			explanation: 'a',
		},
		{
			description: 'A simple beginner guide to planning and planting your first garden.',
			explanation: 'b',
		},
	];

	it( 'renders every suggested SEO description', () => {
		render( <SeoDescriptionPicker descriptions={ descriptions } /> );
		expect( screen.getByText( descriptions[ 0 ].description ) ).toBeInTheDocument();
		expect( screen.getByText( descriptions[ 1 ].description ) ).toBeInTheDocument();
	} );

	it( 'writes the chosen description to the advanced_seo_description meta on click', () => {
		render( <SeoDescriptionPicker descriptions={ descriptions } /> );
		fireEvent.click( screen.getByText( descriptions[ 0 ].description ) );
		expect( mockEditPost ).toHaveBeenCalledWith( {
			meta: { advanced_seo_description: descriptions[ 0 ].description },
		} );
	} );

	it( 'highlights the applied option and calls onComplete', () => {
		const onComplete = jest.fn();
		render( <SeoDescriptionPicker descriptions={ descriptions } onComplete={ onComplete } /> );
		const button = screen
			.getByText( descriptions[ 1 ].description )
			.closest( 'button' ) as HTMLButtonElement;
		fireEvent.click( button );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( onComplete ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'marks the option matching the current SEO description meta as applied on mount', () => {
		mockCurrentMeta = { advanced_seo_description: descriptions[ 0 ].description };
		render( <SeoDescriptionPicker descriptions={ descriptions } /> );
		const applied = screen
			.getByText( descriptions[ 0 ].description )
			.closest( 'button' ) as HTMLButtonElement;
		expect( applied ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( screen.getByText( 'SEO description updated.' ) ).toBeInTheDocument();
	} );
} );
