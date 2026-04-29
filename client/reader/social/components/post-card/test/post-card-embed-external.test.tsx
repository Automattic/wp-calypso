/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { PostCardEmbedExternal } from '../post-card-embed-external';

const embed = {
	type: 'external' as const,
	uri: 'https://example.com/article',
	title: 'Title',
	description: 'Description',
	thumb: 'https://example.com/thumb.jpg',
};

describe( 'PostCardEmbedExternal', () => {
	it( 'renders a link to the external URI', () => {
		render( <PostCardEmbedExternal embed={ embed } parentPostUri="at://post" /> );
		const link = screen.getByRole( 'link' );
		expect( link ).toHaveAttribute( 'href', embed.uri );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
	} );

	it( 'renders title, description and host', () => {
		render( <PostCardEmbedExternal embed={ embed } parentPostUri="at://post" /> );
		expect( screen.getByText( 'Title' ) ).toBeVisible();
		expect( screen.getByText( 'Description' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
	} );

	it( 'renders without a thumbnail when thumb is null', () => {
		const { container } = render(
			<PostCardEmbedExternal embed={ { ...embed, thumb: null } } parentPostUri="at://post" />
		);
		expect( container.querySelector( 'img' ) ).toBeNull();
	} );
} );
