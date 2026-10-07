import { applyStreamEvent, initialStreamState, stateFromSnapshot } from '../stream/reducer';

describe( 'Build Wow stream reducer image planning', () => {
	it( 'retains planned image queries from plan updates', () => {
		const state = applyStreamEvent( initialStreamState( 'run-1' ), 'plan.updated', {
			status: 'proposed',
			images: [
				{ query: 'A sunlit garden path', aspectRatio: '16:9' },
				{ query: 'A hand-painted garden sign', aspectRatio: '1:1' },
			],
		} );

		expect( state.plan?.images ).toEqual( [
			{ query: 'A sunlit garden path', aspectRatio: '16:9' },
			{ query: 'A hand-painted garden sign', aspectRatio: '1:1' },
		] );
	} );

	it( 'restores host preview references without accepting worker URLs', () => {
		const previewId = 'b'.repeat( 64 );
		const state = stateFromSnapshot( 'run-1', 20, {
			images: {
				hero: {
					id: 'hero.svg',
					status: 'ready',
					preview_id: previewId,
					url: 'https://worker.invalid/hero.svg',
				},
			},
		} );
		expect( state.images[ 'hero.svg' ].previewId ).toBe( previewId );
		expect( state.images[ 'hero.svg' ].url ).toBeNull();
	} );

	it( 'restores planned and generating images from a snapshot', () => {
		const state = stateFromSnapshot( 'run-1', 12, {
			plan: {
				status: 'developing',
				images: [ { query: 'A sunlit garden path', aspectRatio: '16:9' } ],
			},
			images: [
				{
					id: 'garden-path.png',
					query: 'A sunlit garden path',
					aspectRatio: '16:9',
					status: 'generating',
					url: null,
				},
			],
		} );

		expect( state.plan?.images ).toEqual( [
			{ query: 'A sunlit garden path', aspectRatio: '16:9' },
		] );
		expect( state.images[ 'garden-path.png' ] ).toEqual( {
			query: 'A sunlit garden path',
			aspectRatio: '16:9',
			status: 'generating',
			url: null,
		} );
	} );
} );
