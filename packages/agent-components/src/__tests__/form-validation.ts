import { readBinding, writeBinding } from '../bindings';
import {
	validateActionEvent,
	validateActionResponse,
	validateComponentOpening,
	validateComponentResult,
	validateSurface,
} from '../validation';
import { applied, negative, opening } from './fixtures';
import type { ComponentActionRequest, ComponentResult } from '../types';

function form(): ComponentResult {
	const result = opening();
	result.component = 'ability-form';
	result.surface.data = {
		site: { name: 'Example', goal: 'publish', topics: [ 'news' ], visitors: 42 },
	};
	result.surface.components = {
		root: { id: 'root', type: 'Column', children: [ 'details', 'topics', 'run' ] },
		details: { id: 'details', type: 'Row', children: [ 'name', 'goal', 'visitors' ] },
		name: {
			id: 'name',
			type: 'TextField',
			label: 'Name',
			path: '/site/name',
			inputMode: 'shortText',
			required: true,
		},
		goal: {
			id: 'goal',
			type: 'ChoicePicker',
			label: 'Goal',
			path: '/site/goal',
			mode: 'single',
			options: [ { value: 'publish', label: 'Publish' } ],
		},
		topics: {
			id: 'topics',
			type: 'ChoicePicker',
			label: 'Topics',
			path: '/site/topics',
			mode: 'multiple',
			options: [
				{ value: 'news', label: 'News' },
				{ value: 'photos', label: 'Photos' },
			],
		},
		visitors: {
			id: 'visitors',
			type: 'Text',
			variant: 'caption',
			content: { path: '/site/visitors' },
		},
		run: { id: 'run', type: 'Button', label: 'Save', action: 'site.save', variant: 'primary' },
	};
	return result;
}

function metadata( result = form() ) {
	return {
		protocol: 'agent-component/0.1',
		result,
		allowedActions: [ 'site.save' ],
		actionBindings: { 'site.save': [ '/site/name', '/site/goal', '/site/topics' ] },
		expiresAt: '2026-09-30T12:00:00Z',
	};
}

describe( 'editable component contracts', () => {
	it( 'accepts all six primitives and validates authenticated editable-only eligibility', () => {
		expect( validateComponentResult( form() ) ).toEqual( form() );
		expect( validateComponentOpening( metadata() ) ).toEqual( metadata() );
		for ( const paths of [
			[ '/site/visitors' ],
			[ '/site/unknown' ],
			[ '/site/name', '/site/name' ],
		] ) {
			expect(
				validateComponentOpening( { ...metadata(), actionBindings: { 'site.save': paths } } )
			).toBeNull();
		}
		expect(
			validateComponentOpening( { ...metadata(), allowedActions: [ 'forged' ] } )
		).toBeNull();
		expect( validateComponentOpening( { ...metadata(), hidden: 'secret' } ) ).toBeNull();
	} );

	it( 'rejects hidden data, unsafe paths, conflicting bindings, invalid choices and malformed optional values', () => {
		const invalid = [
			{ ...form().surface, data: { ...form().surface.data, hidden: 'secret' } },
			{
				...form().surface,
				data: { site: { name: 'Example', goal: 'unknown', topics: [ 'news' ], visitors: 42 } },
			},
			{
				...form().surface,
				data: {
					site: { name: 'Example', goal: 'publish', topics: [ 'news', 'news' ], visitors: 42 },
				},
			},
			{
				...form().surface,
				components: {
					...form().surface.components,
					name: { ...form().surface.components.name, path: '/site/constructor' },
				},
			},
			{
				...form().surface,
				components: {
					...form().surface.components,
					name: { ...form().surface.components.name, inputMode: [ 'shortText' ] },
				},
			},
			{
				...form().surface,
				components: {
					...form().surface.components,
					name: { ...form().surface.components.name, disabled: 'false' },
				},
			},
			{
				...form().surface,
				components: {
					...form().surface.components,
					goal: { ...form().surface.components.goal, path: '/site/name' },
				},
			},
		];
		for ( const surface of invalid ) {
			expect( validateSurface( surface ) ).toBeNull();
		}
		const sparse = form().surface;
		sparse.data.site = { name: 'Example', goal: 'publish', topics: Array( 1 ), visitors: 42 };
		expect( validateSurface( sparse ) ).toBeNull();
		expect(
			validateComponentOpening( { ...metadata(), actionBindings: { 'site.save': Array( 1 ) } } )
		).toBeNull();
	} );

	it( 'rejects prototype keys and oversized UTF-8 payloads before mounting', () => {
		const result = form();
		result.surface.data = JSON.parse( '{"site":{"__proto__":"secret"}}' );
		expect( validateComponentResult( result ) ).toBeNull();
		const large = opening();
		large.summary = '😀'.repeat( 8192 );
		large.surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: { text: '😀'.repeat( 8192 ) },
		};
		expect( validateComponentResult( large ) ).toBeNull();
	} );

	it( 'requires exact editable values and freezes the event without leaking read-only data', () => {
		const event = {
			name: 'site.save',
			values: { '/site/name': 'Changed', '/site/goal': 'publish', '/site/topics': [ 'photos' ] },
		};
		const validate = ( value: unknown ) =>
			validateActionEvent(
				value,
				form().surface,
				new Set( [ 'site.save' ] ),
				metadata().actionBindings
			);
		const validated = validate( event );
		expect( validated ).toEqual( event );
		event.values[ '/site/topics' ].push( 'news' );
		expect( validated?.values[ '/site/topics' ] ).toEqual( [ 'photos' ] );
		expect(
			validate( { ...event, values: { ...event.values, '/site/visitors': '42' } } )
		).toBeNull();
		expect( validate( { ...event, values: { '/site/name': 'Changed' } } ) ).toBeNull();
		expect( validate( { ...event, name: 'forged' } ) ).toBeNull();
	} );

	it( 'enforces Unicode, component, option and graph-depth boundaries', () => {
		const result = form();
		result.surface.data.site = {
			name: '😀'.repeat( 8192 ),
			goal: 'publish',
			topics: [ 'news' ],
			visitors: 42,
		};
		expect( validateComponentResult( result ) ).not.toBeNull();
		result.surface.data.site = {
			name: '😀'.repeat( 8193 ),
			goal: 'publish',
			topics: [ 'news' ],
			visitors: 42,
		};
		expect( validateComponentResult( result ) ).toBeNull();
		result.surface.data.site = {
			name: '\ud800',
			goal: 'publish',
			topics: [ 'news' ],
			visitors: 42,
		};
		expect( validateComponentResult( result ) ).toBeNull();
		const surface = form().surface;
		const goal = surface.components.goal;
		if ( goal.type !== 'ChoicePicker' ) {
			throw new Error( 'Missing fixture choice.' );
		}
		goal.options = Array.from( { length: 100 }, ( _, index ) => ( {
			value: index ? `option-${ index }` : 'publish',
			label: 'Option',
		} ) );
		expect( validateSurface( surface ) ).not.toBeNull();
		goal.options.push( { value: 'one-too-many', label: 'Extra' } );
		expect( validateSurface( surface ) ).toBeNull();
		for ( const count of [ 128, 129 ] ) {
			const bounded = opening().surface;
			bounded.components = Object.fromEntries(
				Array.from( { length: count - 1 }, ( _, index ) => [
					`text-${ index }`,
					{ id: `text-${ index }`, type: 'Text', variant: 'body', content: { text: 'Text' } },
				] )
			);
			bounded.components.root = {
				id: 'root',
				type: 'Column',
				children: Object.keys( bounded.components ),
			};
			expect( validateSurface( bounded ) !== null ).toBe( count === 128 );
		}
		for ( const depth of [ 16, 17 ] ) {
			const bounded = opening().surface;
			bounded.components = Object.fromEntries(
				Array.from( { length: depth + 1 }, ( _, index ) => [
					index ? `level-${ index }` : 'root',
					{
						id: index ? `level-${ index }` : 'root',
						type: 'Column',
						children: index === depth ? [] : [ `level-${ index + 1 }` ],
					},
				] )
			);
			expect( validateSurface( bounded ) !== null ).toBe( depth === 16 );
		}
	} );

	it( 'reads existing paths and writes immutable drafts without creating or traversing unsafe keys', () => {
		const data = form().surface.data;
		const next = writeBinding( data, '/site/name', 'Changed' );
		expect( readBinding( next!, '/site/name' ) ).toBe( 'Changed' );
		expect( readBinding( data, '/site/name' ) ).toBe( 'Example' );
		expect( writeBinding( data, '/site/new', 'Value' ) ).toBeNull();
		expect( readBinding( data, '/site/__proto__' ) ).toBeUndefined();
	} );

	it( 'accepts field-error and native-failure replacements while rejecting internal and mismatched wire states', () => {
		const result = form();
		const request: ComponentActionRequest = {
			protocol: 'agent-component/0.1',
			instanceId: result.instanceId,
			expectedRevision: 1,
			requestId: 'request-123',
			event: { name: 'site.save', values: {} },
		};
		const correction = form();
		correction.revision = 2;
		const response = {
			protocol: 'agent-component/0.1',
			requestId: request.requestId,
			outcome: 'invalid-input',
			current: {
				protocol: 'agent-component/0.1',
				resolvedLocale: 'en',
				request: {
					state: 'settled',
					requestId: request.requestId,
					outcome: 'invalid-input',
					revision: 2,
				},
				state: 'awaiting-input',
				instanceId: result.instanceId,
				revision: 2,
				result: correction,
				allowedActions: [ 'site.save' ],
				actionBindings: metadata().actionBindings,
				expiresAt: metadata().expiresAt,
			},
		};
		expect( validateActionResponse( response, request, result ) ).toEqual( response );
		expect(
			validateActionResponse(
				{
					...response,
					current: { ...response.current, state: 'unauthorized', reason: 'PERMISSION_DENIED' },
				},
				request,
				result
			)
		).toBeNull();
		expect(
			validateActionResponse(
				{
					...response,
					current: { ...response.current, actionBindings: { 'site.save': [ '/site/visitors' ] } },
				},
				request,
				result
			)
		).toBeNull();
		const failed = applied();
		const nativeFailure = {
			...failed,
			outcome: 'failed',
			current: { ...failed.current, request: { ...failed.current.request, outcome: 'failed' } },
		};
		expect(
			validateActionResponse(
				nativeFailure,
				{ ...request, event: { name: 'tool.execute', values: {} } },
				opening()
			)
		).toEqual( nativeFailure );
		const unavailable = negative( 'rejected' );
		expect(
			validateActionResponse(
				{
					...unavailable,
					current: {
						...unavailable.current,
						request: {
							state: 'settled',
							requestId: request.requestId,
							outcome: [ 'rejected' ],
							revision: 1,
						},
					},
				},
				request,
				opening()
			)
		).toBeNull();
	} );
} );
