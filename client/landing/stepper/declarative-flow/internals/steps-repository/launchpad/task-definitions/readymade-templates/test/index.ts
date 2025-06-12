// @ts-nocheck - TODO: Fix TypeScript issues
import { getGenerateContentTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getGenerateContentTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'use the calypso path from backend', () => {
		expect( getGenerateContentTask( task, 'flowId', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path',
		} );
	} );
} );
