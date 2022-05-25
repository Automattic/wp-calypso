import { ROUTE_SET, COMMENTS_LIKE } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( 1337 );
	} );

	test( 'should default to an empty list', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( [] );
	} );

	test( 'should add actions to the log', () => {
		const actions = [
			{
				type: ROUTE_SET,
				path: '/themes/77203074',
			},
			{
				type: ROUTE_SET,
				path: '/themes/foobar',
			},
		];
		const state = actions.reduce( reducer, undefined );

		expect( state ).toEqual( [
			{ ...actions[ 0 ], timestamp: 1337 },
			{ ...actions[ 1 ], timestamp: 1337 },
		] );
	} );

	test( 'should discard them if payload is irrelevant', () => {
		const actions = [
			{
				type: COMMENTS_LIKE,
				path: '/menus/77203074',
			},
			{
				type: COMMENTS_LIKE,
				path: '/menus/foobar',
			},
		];
		const state = actions.reduce( reducer, undefined );

		expect( state ).toEqual( [] );
	} );

	test( 'should log actions with relevant analytics meta', () => {
		const actions = [
			{
				type: ROUTE_SET,
				path: '/themes/77203074',
				meta: {
					analytics: [
						{
							type: 'ANALYTICS_EVENT_RECORD',
							payload: {
								service: 'tracks',
								name: 'calypso_themeshowcase_theme_click',
								properties: {},
							},
						},
					],
				},
			},
			{
				type: COMMENTS_LIKE,
				path: '/menus/foobar',
				meta: {
					analytics: [
						{
							type: 'ANALYTICS_EVENT_RECORD',
							payload: {
								service: 'tracks',
								name: 'calypso_themeshowcase_theme_click',
								properties: {},
							},
						},
					],
				},
			},
		];
		const state = actions.reduce( reducer, undefined );

		expect( state ).toEqual( [
			{ ...actions[ 0 ], timestamp: 1337 },
			{ ...actions[ 1 ], timestamp: 1337 },
		] );
	} );

	test( 'should discard actions with irrelevant analytics meta', () => {
		const actions = [
			{
				type: ROUTE_SET,
				path: '/themes/77203074',
				meta: {
					analytics: [
						{
							type: 'ANALYTICS_EVENT_RECORD',
							payload: {
								service: 'tracks',
								name: 'calypso_all_your_base_are_belong_to_us',
								properties: {},
							},
						},
					],
				},
			},
			{
				type: COMMENTS_LIKE,
				path: '/menus/foobar',
				meta: {
					analytics: [
						{
							type: 'ANALYTICS_EVENT_RECORD',
							payload: {
								service: 'tracks',
								name: 'calypso_all_your_base_are_belong_to_us',
								properties: {},
							},
						},
					],
				},
			},
		];
		const state = actions.reduce( reducer, undefined );

		expect( state ).toEqual( [ { ...actions[ 0 ], timestamp: 1337 } ] );
	} );
} );
