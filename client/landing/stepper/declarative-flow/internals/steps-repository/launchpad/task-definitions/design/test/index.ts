// @ts-nocheck - TODO: Fix TypeScript issues
import { getDesignCompletedTask, getDesignEditedTask, getDesignSelectedTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getDesignEditedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'use the calypso path with query params', () => {
		expect( getDesignEditedTask( task, 'flowId', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path?canvas=edit',
		} );
	} );
} );

describe( 'getDesignCompletedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'use the calypso path with query params', () => {
		expect( getDesignCompletedTask( task, 'flowId', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path?flowToReturnTo=flowId',
		} );
	} );
} );

describe( 'getDesignSelectedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'use the calypso path with query params', () => {
		expect( getDesignSelectedTask( task, 'flowId', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path?flowToReturnTo=flowId',
		} );
	} );
} );
