import { ALL_AI_AGENTS_ACTOR_ID, withAllAiAgents } from '../actor-selector';

const translate = ( text ) => text;
const person = { key: 'wpcom:1', name: 'Todd W', count: 3 };

describe( 'withAllAiAgents', () => {
	test( 'lists "All AI agents" first while that filter is on, so the button has a label', () => {
		expect( withAllAiAgents( [ person ], [ ALL_AI_AGENTS_ACTOR_ID ], translate ) ).toEqual( [
			{ key: ALL_AI_AGENTS_ACTOR_ID, name: 'All AI agents' },
			person,
		] );
	} );

	test( 'leaves the list alone while that filter is off', () => {
		expect( withAllAiAgents( [ person ], [ 'wpcom:1' ], translate ) ).toEqual( [ person ] );
		expect( withAllAiAgents( [ person ], undefined, translate ) ).toEqual( [ person ] );
	} );
} );
