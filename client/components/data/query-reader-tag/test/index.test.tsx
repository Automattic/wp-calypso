/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import reader from 'calypso/state/reader/reducer';
import getReaderTagBySlug from 'calypso/state/reader/tags/selectors/get-reader-tag-by-slug';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QueryReaderTag from '../index';

const TestComponent = ( { slug }: { slug: string } ) => {
	const tag = useSelector( ( state ) => getReaderTagBySlug( state, slug ) ) as
		| { displayName?: string; error?: boolean; slug: string }
		| null
		| undefined;

	if ( ! tag ) {
		return null;
	}

	if ( tag.error ) {
		return <>{ `error:${ tag.slug }` }</>;
	}

	return <>{ tag.displayName ?? '' }</>;
};

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

describe( 'QueryReaderTag', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fills the redux store with the fetched tag', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/tags/chickens' )
			.query( true )
			.reply( 200, {
				tag: {
					ID: '307',
					slug: 'chickens',
					title: 'Chickens',
					display_name: 'chickens',
					URL: 'https://public-api.wordpress.com/rest/v1.2/read/tags/chickens/posts',
				},
			} );

		renderWithProvider(
			<>
				<QueryReaderTag tag="chickens" />
				<TestComponent slug="chickens" />
			</>,
			{ queryClient: getQueryClient(), reducers: { reader } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'Chickens' ) ).toBeInTheDocument();
		} );
	} );

	it( 'stores an error placeholder on 404', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/tags/missing' )
			.query( true )
			.reply( 404, { error: 'not_found' } );

		renderWithProvider(
			<>
				<QueryReaderTag tag="missing" />
				<TestComponent slug="missing" />
			</>,
			{ queryClient: getQueryClient(), reducers: { reader } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'error:missing' ) ).toBeInTheDocument();
		} );
	} );
} );
