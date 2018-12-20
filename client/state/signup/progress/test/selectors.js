/** @format */

/**
 * Internal dependencies
 */
import { getLastIncompleteSignupStep, getSignupProgress } from '../selectors';

describe( 'selectors', () => {
	describe( 'getSignupProgress', () => {
		test( 'should return empty array as a default state', () => {
			const state = { signup: undefined };
			expect( getSignupProgress( state, [] ) ).toEqual( [] );
		} );

		test( 'should return signupDependencyStore instance from the state', () => {
			const state = {
				signup: {
					progress: [
						{
							status: 'completed',
							stepName: 'site-selection',
						},
					],
				},
			};
			expect( getSignupProgress( state, [] ) ).toEqual( [
				{
					status: 'completed',
					stepName: 'site-selection',
				},
			] );
		} );
	} );

	describe( 'getLastIncompleteSignupStep', () => {
		test( 'should return `null` if no in-progress step is found', () => {
			const state = {
				signup: {
					progress: [
						{
							status: 'completed',
							stepName: 'site-selection',
						},
					],
				},
			};
			expect( getLastIncompleteSignupStep( state ) ).toEqual( null );
		} );

		test( 'should return in-progress step', () => {
			const state = {
				signup: {
					progress: [
						{
							status: 'in-progress',
							stepName: 'site-selection',
							lastUpdated: 1545177977594,
						},
						{
							status: 'completed',
							stepName: 'site-selection',
							lastUpdated: 1545178014418,
						},
					],
				},
			};
			expect( getLastIncompleteSignupStep( state ) ).toEqual( state.signup.progress[ 0 ] );
		} );

		test( 'should return latest in-progress step', () => {
			const state = {
				signup: {
					progress: [
						{
							status: 'in-progress',
							stepName: 'site-selection',
							lastUpdated: 1545177977594,
						},
						{
							status: 'completed',
							stepName: 'site-topic',
							lastUpdated: 1545178012653,
						},
						{
							status: 'in-progress',
							stepName: 'plans',
							lastUpdated: 1545178014418,
						},
					],
				},
			};
			expect( getLastIncompleteSignupStep( state ) ).toEqual( state.signup.progress[ 2 ] );
		} );
	} );
} );
