/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRecommendedListMutation } from 'calypso/data/reader/recommendations/use-recommend-list-mutation';
import { RecommendButton } from '../';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( func ) => func() ),
	useDispatch: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/data/reader/recommendations/use-recommend-list-mutation', () => ( {
	useRecommendedListMutation: jest.fn(),
} ) );

describe( 'RecommendButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'adds a feed to a recommended list when is not recommended', async () => {
		const add = jest.fn();
		const remove = jest.fn();
		const feedId = 123;

		jest.mocked( useRecommendedListMutation ).mockReturnValue( {
			add,
			remove,
		} );

		render( <RecommendButton feedId={ feedId } isRecommended={ false } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Recommend this blog' } ) );

		await waitFor( () => {
			expect( add ).toHaveBeenCalledWith( feedId );
		} );
	} );

	it( 'removes a feed from a recommended list when is recommended', async () => {
		const add = jest.fn();
		const remove = jest.fn();
		const feedId = 123;

		jest.mocked( useRecommendedListMutation ).mockReturnValue( {
			add,
			remove,
		} );

		render( <RecommendButton feedId={ feedId } isRecommended /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Recommended' } ) );

		await waitFor( () => {
			expect( remove ).toHaveBeenCalledWith( feedId );
		} );
	} );
} );
