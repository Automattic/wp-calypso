/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient } from '@tanstack/react-query';
import { getEnhancedTasks } from '../';
import { buildTask } from '../../test/lib/fixtures';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const queryClient = new QueryClient( {
	defaultOptions: {},
} );

describe( 'getEnhancedTasks', () => {
	const defaultProps = {
		site: null,
		siteSlug: 'fake.wordpress.com',
		flow: '',
		queryClient,
		submit: noop,
		setShowPlansModal: noop,
	};

	describe( 'when a task should not be enhanced', () => {
		it( 'then it is not enhanced', () => {
			const fakeTasks = [
				buildTask( { id: 'fake-task-1' } ),
				buildTask( { id: 'fake-task-2' } ),
				buildTask( { id: 'fake-task-3' } ),
			];
			expect(
				getEnhancedTasks( {
					...defaultProps,
					tasks: fakeTasks,
				} )
			).toEqual( fakeTasks );
		} );
	} );
	describe( 'when creating the email verification task', () => {
		describe( 'and the user email has been verified', () => {
			it( 'marks the task as complete', () => {
				const fakeTasks = [ buildTask( { id: 'verify_email', completed: false } ) ];
				const isEmailVerified = true;
				const enhancedTasks = getEnhancedTasks( {
					...defaultProps,
					tasks: fakeTasks,
					flow: 'newsletter',
					isEmailVerified,
				} );
				expect( enhancedTasks[ 0 ].completed ).toEqual( true );
			} );
		} );
	} );
} );
