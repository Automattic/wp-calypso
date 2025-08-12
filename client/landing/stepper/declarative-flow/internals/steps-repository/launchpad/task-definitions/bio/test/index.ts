// @ts-nocheck - TODO: Fix TypeScript issues
import { getLinksAddedTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getLinksAddedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'use the calypso path with query params', () => {
		expect( getLinksAddedTask( task, 'flowId', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path',
		} );
	} );
} );
