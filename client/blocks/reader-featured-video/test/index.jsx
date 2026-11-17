/** @jest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import ReaderFeaturedVideo from '..';

jest.mock( '@automattic/api-core', () => ( {
	POCKETCAST_DEFAULT_HEIGHT: 400,
	POCKETCAST_DEFAULT_WIDTH: 400,
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	readerThumbnailQuery: () => ( {
		queryKey: [ 'read', 'thumbnail' ],
		queryFn: () => 'https://example.com/thumbnail.jpg',
		initialData: 'https://example.com/thumbnail.jpg',
		staleTime: Infinity,
	} ),
} ) );

jest.mock( 'calypso/blocks/reader-featured-image', () => () => null );

const iframe = '<iframe src="https://example.com/embed/first" title="Video player"></iframe>';
const props = {
	iframe,
	autoplayIframe: iframe,
	videoEmbed: {
		iframe,
		src: 'https://youtu.be/sqqVQSeMO-M',
		width: 768,
		height: 426,
		aspectRatio: 1.8,
	},
	isExpanded: true,
};

function renderVideo() {
	const client = new QueryClient();
	return render( <ReaderFeaturedVideo { ...props } />, {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
		),
	} );
}

describe( 'ReaderFeaturedVideo', () => {
	it( 'preserves the player when unrelated props and embed metadata change', () => {
		const { rerender } = renderVideo();
		const player = screen.getByTitle( 'Video player' );

		rerender(
			<ReaderFeaturedVideo
				{ ...props }
				videoEmbed={ { ...props.videoEmbed } }
				className="progress-updated"
			/>
		);

		expect( screen.getByTitle( 'Video player' ) ).toBe( player );
	} );

	it( 'replaces the player when the embed HTML changes', () => {
		const { rerender } = renderVideo();
		const player = screen.getByTitle( 'Video player' );

		rerender(
			<ReaderFeaturedVideo
				{ ...props }
				autoplayIframe='<iframe src="https://example.com/embed/second" title="Video player"></iframe>'
			/>
		);

		expect( screen.getByTitle( 'Video player' ) ).not.toBe( player );
		expect( screen.getByTitle( 'Video player' ) ).toHaveAttribute(
			'src',
			'https://example.com/embed/second'
		);
	} );
} );
