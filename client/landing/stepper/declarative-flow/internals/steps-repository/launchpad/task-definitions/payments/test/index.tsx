// @ts-nocheck - TODO: Fix TypeScript issues
import { getSetupPaymentsTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { TaskContext } from '../../../types';

describe( 'getSetupPaymentsTask', () => {
	const task = buildTask( { id: 'task' } );
	const buildContext = ( options?: Partial< TaskContext > ) => {
		return {
			tasks: [],
			...options,
		} as TaskContext;
	};

	it( 'is linkable', () => {
		expect( getSetupPaymentsTask( task, 'newsletter', buildContext() ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: expect.any( String ),
		} );
	} );

	it( 'use the stripeConnectUrl if it is provided', () => {
		expect(
			getSetupPaymentsTask(
				task,
				'newsletter',
				buildContext( { stripeConnectUrl: 'some-stripe-connect-url' } )
			)
		).toHaveProperty( 'calypso_path', 'some-stripe-connect-url' );
	} );

	it( 'sets badge_text as null if task is not completed', () => {
		expect( getSetupPaymentsTask( task, 'newsletter', buildContext() ) ).toMatchObject( {
			badge_text: null,
		} );
	} );

	it( 'sets badge_text as "Connected" if task is completed', () => {
		expect(
			getSetupPaymentsTask( { ...task, completed: true }, 'newsletter', buildContext() )
		).toMatchObject( {
			badge_text: 'Connected',
		} );
	} );
} );
