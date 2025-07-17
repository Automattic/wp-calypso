/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useRecommendedSite } from 'calypso/landing/subscriptions/hooks/use-recommended-site';
import { useDispatch } from 'calypso/state';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { requestRecommendedBlogsListItems } from 'calypso/state/reader/lists/actions';
import {
	hasRequestedUserRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} from 'calypso/state/reader/lists/selectors';
import { RecommendButton } from '../';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( func ) => func() ),
	useDispatch: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/landing/subscriptions/hooks/use-recommended-site', () => ( {
	useRecommendedSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserName: jest.fn(),
} ) );
jest.mock( 'calypso/state/reader/lists/selectors', () => ( {
	isRequestingUserRecommendedBlogs: jest.fn().mockReturnValue( false ),
	hasRequestedUserRecommendedBlogs: jest.fn().mockReturnValue( false ),
} ) );

jest.mock( 'calypso/state/reader/lists/actions', () => ( {
	requestRecommendedBlogsListItems: jest.fn(),
} ) );

describe( 'RecommendButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useRecommendedSite ).mockReturnValue( {
			isRecommended: false,
			isUpdating: false,
			toggleRecommended: jest.fn(),
			canToggle: false,
		} );
	} );

	it( 'renders the recommended button when is possible to recommend and is not recommended', () => {
		render( <RecommendButton feedId={ 1 } /> );

		expect( screen.getByRole( 'button', { name: 'Recommend this blog' } ) ).toBeVisible();
	} );

	it( 'renders the recommended button when is possible to recommend and is recommended', () => {
		jest.mocked( useRecommendedSite ).mockReturnValue( {
			isRecommended: true,
			isUpdating: false,
			toggleRecommended: jest.fn(),
			canToggle: true,
		} );

		render( <RecommendButton feedId={ 1 } /> );

		expect( screen.getByRole( 'button', { name: 'Recommended' } ) ).toBeVisible();
	} );

	it( 'disables the button when is requesting the recommended blogs list', () => {
		jest.mocked( isRequestingUserRecommendedBlogs ).mockReturnValue( true );

		render( <RecommendButton feedId={ 1 } /> );

		expect( screen.getByRole( 'button', { name: 'Recommend this blog' } ) ).toBeDisabled();
	} );

	it( 'request the recommended blogs list when is not requested', () => {
		const requester = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( requester );
		jest.mocked( isRequestingUserRecommendedBlogs ).mockReturnValue( false );
		jest.mocked( hasRequestedUserRecommendedBlogs ).mockReturnValue( false );
		jest.mocked( getCurrentUserName ).mockReturnValue( 'owner_user_name' );

		render( <RecommendButton feedId={ 1 } /> );

		expect( requestRecommendedBlogsListItems ).toHaveBeenCalledWith( 'owner_user_name' );
	} );
} );
