/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardCounts } from '../post-card-counts';

describe( 'PostCardCounts', () => {
	it( 'renders all four counts with screen-reader labels next to them', () => {
		render( <PostCardCounts counts={ { replies: 1, reposts: 2, likes: 3, quotes: 4 } } /> );
		expect( screen.getByText( /replies:/i ).parentElement ).toHaveTextContent( /replies:\s*1/i );
		expect( screen.getByText( /reposts:/i ).parentElement ).toHaveTextContent( /reposts:\s*2/i );
		expect( screen.getByText( /likes:/i ).parentElement ).toHaveTextContent( /likes:\s*3/i );
		expect( screen.getByText( /quotes:/i ).parentElement ).toHaveTextContent( /quotes:\s*4/i );
	} );

	it( 'renders zeros without crashing', () => {
		render( <PostCardCounts counts={ { replies: 0, reposts: 0, likes: 0, quotes: 0 } } /> );
		expect( screen.getByText( /replies:/i ).parentElement ).toHaveTextContent( /replies:\s*0/i );
	} );
} );
