import { validateAppliedResponse, validateComponentResult } from '../validation';
import { applied, completed, opening } from './fixtures';
import type { ComponentActionRequest } from '../types';

const request: ComponentActionRequest = {
	protocol: 'agent-component/0.1',
	instanceId: 'instance-123',
	expectedRevision: 1,
	requestId: 'request-123',
	event: { name: 'tool.execute', values: {} },
};

describe( 'component validation', () => {
	it( 'accepts the backend opening and completed replacements', () => {
		expect( validateComponentResult( opening() ) ).toEqual( opening() );
		expect( validateComponentResult( completed() ) ).toEqual( completed() );
		const response = applied();
		expect( validateAppliedResponse( response, request, opening() ) ).toEqual( {
			result: completed(),
			expiresAt: response.current.expiresAt,
		} );
	} );

	it.each( [
		{ ...opening(), protocol: 'agent-component/0.2' },
		{ ...opening(), component: 'site-profile' },
		{ ...opening(), instanceId: 'invalid identifier' },
		{ ...opening(), revision: 2 },
		{ ...opening(), arguments: { plugin: 'hidden' } },
		{ ...opening(), surface: { ...opening().surface, protocol: 'minimal-ai-ui/0.2' } },
		{ ...opening(), surface: { ...opening().surface, data: { secret: 'hidden' } } },
	] )( 'rejects unsupported or unexpected opening data (%#)', ( result ) => {
		expect( validateComponentResult( result ) ).toBeNull();
	} );

	it.each( [
		{ id: 'proposal', type: 'Text', variant: [ 'body' ], content: { text: 'text' } },
		{
			id: 'proposal',
			type: 'Text',
			variant: 'status',
			tone: [ 'success' ],
			content: { text: 'text' },
		},
		{ id: 'proposal', type: 'Text', variant: 'body', content: { path: '/secret' } },
		{ id: 'proposal', type: 'TextField', label: 'Name' },
		{ id: 'proposal', type: 'Column', children: [ 'root' ] },
		{ id: 'proposal', type: 'Column', children: [ 'missing' ] },
		{ id: 'proposal', type: 'Column', children: [ 'run' ] },
	] )( 'rejects malformed, unsupported or cyclic components (%#)', ( proposal ) => {
		const result = opening();
		expect(
			validateComponentResult( {
				...result,
				surface: { ...result.surface, components: { ...result.surface.components, proposal } },
			} )
		).toBeNull();
	} );

	it( 'rejects button state attributes outside the confirmation contract', () => {
		for ( const property of [ 'disabled', 'loading' ] ) {
			const result = opening();
			result.surface.components.run = {
				...result.surface.components.run,
				[ property ]: true,
			};
			expect( validateComponentResult( result ) ).toBeNull();
		}
	} );

	it( 'requires exactly one opening button and no completed button', () => {
		const result = opening();
		result.surface.components.root = { id: 'root', type: 'Column', children: [ 'proposal' ] };
		delete result.surface.components.run;
		expect( validateComponentResult( result ) ).toBeNull();
		expect(
			validateComponentResult( { ...opening(), revision: 2, status: 'completed' } )
		).toBeNull();
	} );

	it.each( [
		{ ...applied(), protocol: 'agent-component/0.2' },
		{ ...applied(), requestId: 'other-request' },
		{ ...applied(), current: { ...applied().current, protocol: 'agent-component/0.2' } },
		{ ...applied(), current: { ...applied().current, instanceId: 'other-instance' } },
		{ ...applied(), current: { ...applied().current, revision: 1 } },
		{ ...applied(), current: { ...applied().current, allowedActions: [ 'tool.execute' ] } },
		{
			...applied(),
			current: {
				...applied().current,
				request: { ...applied().current.request, requestId: 'other-request' },
			},
		},
		{
			...applied(),
			current: { ...applied().current, result: { ...completed(), instanceId: 'other-instance' } },
		},
		{ ...applied(), current: { ...applied().current, expiresAt: 'invalid' } },
	] )( 'rejects mismatched, stale or unsafe applied responses (%#)', ( response ) => {
		expect( validateAppliedResponse( response, request, opening() ) ).toBeNull();
	} );
} );
