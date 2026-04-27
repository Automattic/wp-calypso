/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardCounts } from '../post-card-counts';

describe( 'PostCardCounts', () => {
	it( 'renders all four counts with their labels', () => {
		render( <PostCardCounts counts={ { replies: 1, reposts: 2, likes: 3, quotes: 4 } } /> );
		expect( screen.getByLabelText( /replies/i ) ).toHaveTextContent( '1' );
		expect( screen.getByLabelText( /reposts/i ) ).toHaveTextContent( '2' );
		expect( screen.getByLabelText( /likes/i ) ).toHaveTextContent( '3' );
		expect( screen.getByLabelText( /quotes/i ) ).toHaveTextContent( '4' );
	} );

	it( 'renders zeros without crashing', () => {
		render( <PostCardCounts counts={ { replies: 0, reposts: 0, likes: 0, quotes: 0 } } /> );
		expect( screen.getByLabelText( /replies/i ) ).toHaveTextContent( '0' );
	} );
} );
