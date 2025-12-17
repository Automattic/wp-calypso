/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock the dependencies
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordGoogleEvent: jest.fn(),
} ) );

jest.mock( 'calypso/components/data/query-post-likers', () => () => null );

// Import the actual component after mocking dependencies
const PostLikes = require( '../index' ).default;

describe( 'PostLikes', () => {
	const mockStore = configureStore( [] );
	let store;

	beforeEach( () => {
		store = mockStore( {
			currentUser: {
				id: 123,
			},
			sites: {
				items: {},
			},
			posts: {
				likes: {
					items: {},
				},
			},
		} );
	} );

	describe( 'renderLike method', () => {
		test( 'should render a link when user has a valid login', () => {
			const likes = [
				{
					ID: 1,
					login: 'testuser',
					name: 'Test User',
					avatar_URL: 'https://example.com/avatar.jpg',
				},
			];

			store = mockStore( {
				currentUser: {
					id: 123,
				},
				sites: {
					items: {
						456: {
							slug: 'testsite.wordpress.com',
						},
					},
				},
				posts: {
					likes: {
						items: {
							456: {
								789: {
									likes,
									found: 1,
									iLike: false,
								},
							},
						},
					},
				},
			} );

			const { container } = render(
				<Provider store={ store }>
					<PostLikes siteId={ 456 } postId={ 789 } />
				</Provider>
			);

			const link = container.querySelector( 'a.post-likes__item' );
			expect( link ).toBeInTheDocument();
			expect( link ).toHaveAttribute( 'href' );
		} );

		test( 'should render a span (not a link) when user has no login', () => {
			const likes = [
				{
					ID: 2,
					login: null,
					name: 'Anonymous User',
					avatar_URL: 'https://example.com/avatar.jpg',
				},
			];

			store = mockStore( {
				currentUser: {
					id: 123,
				},
				sites: {
					items: {
						456: {
							slug: 'testsite.wordpress.com',
						},
					},
				},
				posts: {
					likes: {
						items: {
							456: {
								789: {
									likes,
									found: 1,
									iLike: false,
								},
							},
						},
					},
				},
			} );

			const { container } = render(
				<Provider store={ store }>
					<PostLikes siteId={ 456 } postId={ 789 } />
				</Provider>
			);

			const span = container.querySelector( 'span.post-likes__item' );
			expect( span ).toBeInTheDocument();
			const link = container.querySelector( 'a.post-likes__item' );
			expect( link ).not.toBeInTheDocument();
		} );

		test( 'should render a span (not a link) when user has empty login', () => {
			const likes = [
				{
					ID: 3,
					login: '',
					name: 'Empty Login User',
					avatar_URL: 'https://example.com/avatar.jpg',
				},
			];

			store = mockStore( {
				currentUser: {
					id: 123,
				},
				sites: {
					items: {
						456: {
							slug: 'testsite.wordpress.com',
						},
					},
				},
				posts: {
					likes: {
						items: {
							456: {
								789: {
									likes,
									found: 1,
									iLike: false,
								},
							},
						},
					},
				},
			} );

			const { container } = render(
				<Provider store={ store }>
					<PostLikes siteId={ 456 } postId={ 789 } />
				</Provider>
			);

			const span = container.querySelector( 'span.post-likes__item' );
			expect( span ).toBeInTheDocument();
			const link = container.querySelector( 'a.post-likes__item' );
			expect( link ).not.toBeInTheDocument();
		} );

		test( 'should render a span (not a link) when user has whitespace-only login', () => {
			const likes = [
				{
					ID: 4,
					login: '   ',
					name: 'Whitespace Login User',
					avatar_URL: 'https://example.com/avatar.jpg',
				},
			];

			store = mockStore( {
				currentUser: {
					id: 123,
				},
				sites: {
					items: {
						456: {
							slug: 'testsite.wordpress.com',
						},
					},
				},
				posts: {
					likes: {
						items: {
							456: {
								789: {
									likes,
									found: 1,
									iLike: false,
								},
							},
						},
					},
				},
			} );

			const { container } = render(
				<Provider store={ store }>
					<PostLikes siteId={ 456 } postId={ 789 } />
				</Provider>
			);

			const span = container.querySelector( 'span.post-likes__item' );
			expect( span ).toBeInTheDocument();
			const link = container.querySelector( 'a.post-likes__item' );
			expect( link ).not.toBeInTheDocument();
		} );
	} );
} );
