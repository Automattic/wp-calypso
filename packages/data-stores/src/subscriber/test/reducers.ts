import { subscriber } from '../reducers';
import type { SubscriberState } from '../types';

const EMPTY_STATE = {};

describe( 'Subscriber reducer', () => {
	/**
	 * ↓ Import subscribers
	 */
	it( 'change import inProgress state', () => {
		const state = subscriber( EMPTY_STATE, {
			type: 'IMPORT_CSV_SUBSCRIBERS_START',
			siteId: 1,
		} );

		const expectedState = { import: { inProgress: true } };

		expect( state ).toEqual( expectedState );
	} );

	it( 'import start, update imports array', () => {
		const initState: SubscriberState = {
			hydrated: true,
			import: { inProgress: true },
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 8,
				},
			],
		};

		const state = subscriber( initState, {
			type: 'IMPORT_CSV_SUBSCRIBERS_START_SUCCESS',
			siteId: 1,
			jobId: 11112,
		} );

		const expectedState = {
			hydrated: true,
			import: { inProgress: true, job: { id: 11112 } },
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 8,
				},
				{
					id: 11112,
					status: 'pending',
				},
			],
		};

		expect( state ).toEqual( expectedState );
	} );

	/**
	 * ↓ Add subscribers
	 */
	it( 'manually add subscribers start', () => {
		const state = subscriber( EMPTY_STATE, {
			type: 'ADD_SUBSCRIBERS_START',
			siteId: 1,
		} );

		const expectedState = { add: { inProgress: true } };

		expect( state ).toEqual( expectedState );
	} );

	it( 'manually add subscribers start success', () => {
		const state = subscriber( EMPTY_STATE, {
			type: 'ADD_SUBSCRIBERS_SUCCESS',
			siteId: 1,
			response: {
				subscribed: 2,
				errors: [],
			},
		} );

		const expectedState = {
			add: {
				inProgress: false,
				response: {
					subscribed: 2,
					errors: [],
				},
			},
		};

		expect( state ).toEqual( expectedState );
	} );

	/**
	 * ↓ Get import
	 */
	it( 'get import job, add to `imports` array', () => {
		const initState: SubscriberState = {
			hydrated: true,
			import: { inProgress: true },
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 8,
				},
			],
		};

		const state = subscriber( initState, {
			type: 'GET_SUBSCRIBERS_IMPORT_SUCCESS',
			siteId: 1,
			importJob: {
				id: 11113,
				status: 'importing',
				email_count: 1,
				subscribed_count: 1,
			},
		} );

		const expectedState = {
			hydrated: true,
			import: { inProgress: true },
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 8,
				},
				{
					id: 11113,
					status: 'importing',
					email_count: 1,
					subscribed_count: 1,
				},
			],
		};

		expect( state ).toEqual( expectedState );
	} );

	it( 'get import job, update `imports` array', () => {
		const initState: SubscriberState = {
			hydrated: true,
			import: { inProgress: true },
			imports: [
				{
					id: 11111,
					status: 'importing',
					email_count: 10,
					subscribed_count: 0,
				},
			],
		};

		const state = subscriber( initState, {
			type: 'GET_SUBSCRIBERS_IMPORT_SUCCESS',
			siteId: 1,
			importJob: {
				id: 11111,
				status: 'imported',
				email_count: 10,
				subscribed_count: 10,
			},
		} );

		const expectedState = {
			hydrated: true,
			import: { inProgress: true },
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 10,
				},
			],
		};

		expect( state ).toEqual( expectedState );
	} );

	/**
	 * ↓ Get imports
	 */
	it( 'get imports', () => {
		const state = subscriber( EMPTY_STATE, {
			type: 'GET_SUBSCRIBERS_IMPORTS_SUCCESS',
			siteId: 1,
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 10,
				},
			],
		} );

		const expectedState = {
			hydrated: true,
			imports: [
				{
					id: 11111,
					status: 'imported',
					email_count: 10,
					subscribed_count: 10,
				},
			],
		};

		expect( state ).toEqual( expectedState );
	} );
} );
