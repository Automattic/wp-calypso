/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThreadParent } from '../parts/thread';

describe( 'ThreadParent', () => {
	it( 'tells screen readers which comment the reply answers', () => {
		render(
			<ThreadParent
				comment={ {
					text: 'A comment',
					author_name: 'Mia Chen',
					author_avatar: null,
					date: null,
					url: 'https://site.example/post/#comment-1',
				} }
				truncate
				compact
			/>
		);

		expect( screen.getByText( 'In reply to Mia Chen' ) ).toBeInTheDocument();
	} );
} );
