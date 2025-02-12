import { getLinkInBioLaunchedTask, getLinksAddedTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getLinkInBioLaunchedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'doesnt use the calypso path', () => {
		expect(
			getLinkInBioLaunchedTask( task, 'flowId', buildContext() ).useCalypsoPath
		).toBeUndefined();
	} );
} );

describe( 'getLinksAddedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'use the calypso path with query params', () => {
		expect( getLinksAddedTask( task, 'flowId', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path',
		} );
	} );
} );
