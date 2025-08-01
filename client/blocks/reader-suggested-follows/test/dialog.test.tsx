/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ReactModal from 'react-modal';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import { RelatedSite } from 'calypso/data/reader/use-related-sites';
import ReaderSuggestedFollowsDialog from '../dialog';
import { useRecommendOrRelatedSitesQuery } from '../hooks/use-recommend-or-related-sites-query';

jest.mock( '../hooks/use-recommend-or-related-sites-query' );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
} ) );
jest.mock( '../recommended-feed', () => ( {
	RecommendedFeed: ( { feed }: { feed: FeedRecommendation } ) => <div>{ feed.name }</div>,
} ) );

jest.mock( 'calypso/blocks/reader-suggested-follows', () => ( {
	SuggestedFollowItem: ( { site }: { site: RelatedSite } ) => <div>{ site.name }</div>,
} ) );

ReactModal.setAppElement( '*' );

describe( 'ReaderSuggestedFollowsDialog', () => {
	beforeEach( () => {
		jest.mocked( useRecommendOrRelatedSitesQuery ).mockReturnValue( {
			data: [],
			isLoading: true,
			resourceType: null,
			isFetched: false,
		} );
	} );

	it( 'renders nothing when isVisible is false', () => {
		const { container } = render(
			<ReaderSuggestedFollowsDialog
				onClose={ jest.fn() }
				siteId={ 1 }
				postId={ 2 }
				isVisible={ false }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'closes the modal automatically when all requests are completed and there are no results', () => {
		jest.mocked( useRecommendOrRelatedSitesQuery ).mockReturnValue( {
			data: [],
			isLoading: false,
			resourceType: null,
			isFetched: true,
		} );

		const onClose = jest.fn();
		render(
			<ReaderSuggestedFollowsDialog
				onClose={ onClose }
				siteId={ 1 }
				postId={ 2 }
				isVisible
				author={ { name: 'Test Author', username: 'test-author' } }
			/>
		);
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'renders the loading state', () => {
		jest.mocked( useRecommendOrRelatedSitesQuery ).mockReturnValue( {
			data: [],
			isLoading: true,
			resourceType: null,
			isFetched: false,
		} );

		render(
			<ReaderSuggestedFollowsDialog onClose={ jest.fn() } siteId={ 1 } postId={ 2 } isVisible />
		);
		expect( screen.getByLabelText( 'Loading suggested blogs' ) ).toBeVisible();
	} );

	it( 'renders the recommended feeds', () => {
		jest.mocked( useRecommendOrRelatedSitesQuery ).mockReturnValue( {
			data: [
				{ ID: '1', feedId: '1', name: 'Nice Recommended Blog', feedUrl: 'https://test.com' },
			] as FeedRecommendation[],
			isLoading: false,
			resourceType: 'recommended',
			isFetched: true,
		} );

		render(
			<ReaderSuggestedFollowsDialog
				onClose={ jest.fn() }
				author={ { name: 'Test Author', username: 'test-author' } }
				siteId={ 1 }
				postId={ 2 }
				isVisible
			/>
		);
		expect( screen.getByText( 'Recommended blogs' ) ).toBeVisible();
		expect( screen.getByText( /Test Author/ ) ).toBeVisible();
		expect( screen.getByText( 'Nice Recommended Blog' ) ).toBeVisible();
	} );

	it( 'renders the related sites', () => {
		jest.mocked( useRecommendOrRelatedSitesQuery ).mockReturnValue( {
			data: [ { global_ID: '1', name: 'Related blog' } ] as RelatedSite[],
			isLoading: false,
			resourceType: 'related',
			isFetched: true,
		} );

		render(
			<ReaderSuggestedFollowsDialog onClose={ jest.fn() } siteId={ 1 } postId={ 2 } isVisible />
		);

		expect( screen.getByText( 'Suggested blogs' ) ).toBeVisible();
		expect( screen.getByText( 'Related blog' ) ).toBeVisible();
	} );
} );
