/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import CommentButton from '..';

describe( 'CommentButton', () => {
	it( 'renders the comment count passed by prop without requiring Redux state', () => {
		render( <CommentButton commentCount={ 12 } tagName="button" /> );

		expect( screen.getByRole( 'button', { name: 'Comment' } ) ).toBeVisible();
		expect( screen.getByText( '12' ) ).toBeVisible();
	} );
} );
