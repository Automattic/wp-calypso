/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { act } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { receivePreferences } from 'calypso/state/preferences/actions';
import preferences from 'calypso/state/preferences/reducer';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useFreeHostingTrialAssignment } from '../use-free-hosting-trial-assignment';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config' );

const renderHook = ( hookContainer, initialState = {} ) =>
	renderHookWithProvider( hookContainer, {
		initialState,
		store: undefined,
		reducers: { preferences },
	} );

beforeEach( () => {
	useExperiment.mockImplementation( ( name, options ) => [ !! options?.isEligible, null ] );
	isEnabled.mockReturnValue( false );
} );

test( 'defaults to the control cohort when preferences are already loaded and in the wrong flow', () => {
	const initialState = {
		preferences: { remoteValues: {} }, // signifies that preferences are loaded
	};
	const intent = undefined;

	const { result } = renderHook( () => useFreeHostingTrialAssignment( intent ), initialState );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: false,
	} );
} );

test( 'return control cohort when preferences are already loaded, in the correct flow, and explat assigns to control', () => {
	const initialState = {
		preferences: { remoteValues: {} }, // signifies that preferences are loaded
	};
	const intent = 'plans-new-hosted-site';

	const { result, rerender } = renderHook(
		() => useFreeHostingTrialAssignment( intent ),
		initialState
	);

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: true,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	useExperiment.mockReturnValue( [ false, { variationName: 'control' } ] );

	// Rerender simulates the experiment assignment coming back from the server
	rerender();

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: false,
	} );
} );

test( 'return test cohort when preferences are already loaded, in the correct flow, and explat assigns to control', () => {
	const initialState = {
		preferences: { remoteValues: {} }, // signifies that preferences are loaded
	};
	const intent = 'plans-new-hosted-site';

	const { result, rerender } = renderHook(
		() => useFreeHostingTrialAssignment( intent ),
		initialState
	);

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: true,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	useExperiment.mockReturnValue( [ false, { variationName: 'treatment' } ] );

	// Rerender simulates the experiment assignment coming back from the server
	rerender();

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: true,
	} );
} );

test( 'return control cohort when preferences are already loaded but in the wrong flow', () => {
	const initialState = {
		preferences: { remoteValues: {} }, // signifies that preferences are loaded
	};
	const intent = 'plans-link-in-bio';

	const { result } = renderHook( () => useFreeHostingTrialAssignment( intent ), initialState );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: false,
	} );
} );

test( 'defaults to the control cohort when preferences need to be loaded', async () => {
	const intent = undefined;

	const { result, store } = renderHook( () => useFreeHostingTrialAssignment( intent ) );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	// Preferences finish loading
	await act( () => store.dispatch( receivePreferences( {} ) ) );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: false,
	} );
} );

test( 'return control variant if loaded preferences say user part of an eligible campaign but in incorrect flow', async () => {
	const intent = 'plans-link-in-bio';

	const { result, store } = renderHook( () => useFreeHostingTrialAssignment( intent ) );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	// Preferences finish loading
	await act( () => store.dispatch( receivePreferences( { 'hosting-trial-campaign': 'reddit' } ) ) );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: false,
	} );
} );

test( 'return test variant if loaded preferences say user part of an eligible campaign and in correct flow', async () => {
	const intent = 'plans-new-hosted-site';

	const { result, store } = renderHook( () => useFreeHostingTrialAssignment( intent ) );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	// Preferences finish loading
	await act( () => store.dispatch( receivePreferences( { 'hosting-trial-campaign': 'reddit' } ) ) );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: true,
	} );
} );

test( 'return test cohort when preferences are already loaded, explat assignment is already loaded, and in the correct flow', () => {
	const initialState = {
		preferences: { remoteValues: {} }, // signifies that preferences are loaded
	};
	const intent = 'plans-new-hosted-site';

	useExperiment.mockReturnValue( [ false, { variationName: 'treatment' } ] );

	const { result } = renderHook( () => useFreeHostingTrialAssignment( intent ), initialState );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: true,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: true,
	} );
} );

test( 'fetch cohort assignment after user preferences finish loading and we realise we will require an experiment assignment', async () => {
	const intent = 'plans-new-hosted-site';

	const { result, rerender, store } = renderHook( () => useFreeHostingTrialAssignment( intent ) );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	// Preferences finish loading
	await act( () => store.dispatch( receivePreferences( {} ) ) );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: true,
		isAssignedToHostingTrialExperiment: false,
	} );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: true,
	} );

	useExperiment.mockReturnValue( [ false, { variationName: 'treatment' } ] );

	// Rerender simulates the experiment assignment coming back from the server
	rerender();

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: true,
	} );
} );

test( 'feature flag is ineligible for explat experiment and does not wait for user preferences to load', () => {
	isEnabled.mockImplementation( ( flag ) => flag === 'plans/hosting-trial' );

	const intent = 'plans-new-hosted-site';

	const { result } = renderHook( () => useFreeHostingTrialAssignment( intent ) );

	expect( useExperiment ).toHaveBeenLastCalledWith( 'wpcom_hosting_business_plan_free_trial_v2', {
		isEligible: false,
	} );

	expect( result.current ).toEqual( {
		isLoadingHostingTrialExperiment: false,
		isAssignedToHostingTrialExperiment: true,
	} );
} );
