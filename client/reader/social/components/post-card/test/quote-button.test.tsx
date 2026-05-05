/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SocialAnalyticsProvider } from '../analytics-context';
import { QuoteButton } from '../quote-button';
import type { SocialPost } from '../../../types';

const POST: Pick< SocialPost, 'uri' | 'cid' | 'counts' > = {
	uri: 'at://did:plc:author/app.bsky.feed.post/3kabc',
	cid: 'bafy-cid',
	counts: { replies: 0, reposts: 0, likes: 0, quotes: 4 },
};

function renderButton( { onQuoteClick }: { onQuoteClick?: ( post: SocialPost ) => void } = {} ) {
	return renderWithProvider(
		<SocialAnalyticsProvider
			value={ {
				source: 'atmosphere',
				connectionId: 42,
				onClick: jest.fn(),
				onQuoteClick,
			} }
		>
			<QuoteButton post={ POST as SocialPost } />
		</SocialAnalyticsProvider>
	);
}

describe( '<QuoteButton>', () => {
	it( 'renders a button labelled "Quote, N quotes" with the formatted count', () => {
		renderButton( { onQuoteClick: jest.fn() } );
		const button = screen.getByRole( 'button', { name: /quote, 4 quotes/i } );
		expect( button ).toHaveTextContent( '4' );
	} );

	it( 'calls onQuoteClick with the post when clicked', async () => {
		const onQuoteClick = jest.fn();
		const user = userEvent.setup();
		renderButton( { onQuoteClick } );
		await user.click( screen.getByRole( 'button', { name: /quote, 4 quotes/i } ) );
		expect( onQuoteClick ).toHaveBeenCalledWith( POST );
	} );

	it( 'renders nothing interactive when onQuoteClick is not bound', () => {
		renderButton( {} );
		expect( screen.queryByRole( 'button', { name: /quote/i } ) ).not.toBeInTheDocument();
	} );

	it( 'click does not bubble to a parent listener', async () => {
		const onParentClick = jest.fn();
		const user = userEvent.setup();
		renderWithProvider(
			<SocialAnalyticsProvider
				value={ {
					source: 'atmosphere',
					connectionId: 42,
					onClick: jest.fn(),
					onQuoteClick: jest.fn(),
				} }
			>
				<div role="button" tabIndex={ 0 } onClick={ onParentClick } onKeyDown={ onParentClick }>
					<QuoteButton post={ POST as SocialPost } />
				</div>
			</SocialAnalyticsProvider>
		);

		await user.click( screen.getByRole( 'button', { name: /quote, 4 quotes/i } ) );
		expect( onParentClick ).not.toHaveBeenCalled();
	} );
} );
