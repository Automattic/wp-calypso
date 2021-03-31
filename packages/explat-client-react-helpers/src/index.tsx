/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from 'react';

/**
 * WordPress dependencies
 */
import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client';

interface UseExperimentOptions {
	/**
	 * Determines whether a participant is currenlty eligible for an assignment.
	 * - Only loads the experimentAssignment if isEligible is true.
	 * - Only returns the experimentAssignment if isEligible is true.
	 */
	isEligible: boolean;
}

const defaultUseExperimentOptions: UseExperimentOptions = {
	isEligible: true,
};

interface ExPlatClientReactHelpers {
	/**
	 * An ExPlat useExperiment hook.
	 *
	 * NOTE: Doesn't obey ExperimentAssignment TTL in order to keep stable UX.
	 *
	 * @returns [isExperimentAssignmentLoading, ExperimentAssignment | null]
	 */
	useExperiment: (
		experimentName: string,
		options?: Partial< UseExperimentOptions >
	) => [ boolean, ExperimentAssignment | null ];

	/**
	 * Experiment component, safest and simplest, should be first choice if usable.
	 */
	Experiment: ( props: {
		name: string;
		defaultExperience: React.ReactNode;
		treatmentExperience: React.ReactNode;
		loadingExperience: React.ReactNode;
		options?: Partial< UseExperimentOptions >;
	} ) => JSX.Element;

	/**
	 * Inject experiment data into a child component.
	 * Use when hooks aren't available.
	 */
	ProvideExperimentData: ( props: {
		children: (
			isLoading: boolean,
			experimentAssignment: ExperimentAssignment | null
		) => JSX.Element;
		name: string;
		options?: Partial< UseExperimentOptions >;
	} ) => JSX.Element;
}

export default function createExPlatClientReactHelpers(
	exPlatClient: ExPlatClient
): ExPlatClientReactHelpers {
	const useExperiment = (
		experimentName: string,
		providedOptions: Partial< UseExperimentOptions > = {}
	): [ boolean, ExperimentAssignment | null ] => {
		const options: UseExperimentOptions = { ...defaultUseExperimentOptions, ...providedOptions };

		const [ previousExperimentName ] = useState( experimentName );
		const [ state, setState ] = useState< [ boolean, ExperimentAssignment | null ] >( [
			true,
			null,
		] );
		const hasStartedLoadingRef = useRef< boolean >( false );

		useEffect( () => {
			let isSubscribed = true;
			if ( hasStartedLoadingRef.current === false && options.isEligible ) {
				hasStartedLoadingRef.current = true;
				exPlatClient.loadExperimentAssignment( experimentName ).then( ( experimentAssignment ) => {
					if ( isSubscribed ) {
						setState( [ false, experimentAssignment ] );
					}
				} );
			}
			return () => {
				isSubscribed = false;
			};
			// We don't expect experimentName to ever change and if it does we want to assignment to stay constant.
		}, [ experimentName, options.isEligible ] );

		if (
			experimentName !== previousExperimentName &&
			! previousExperimentName.startsWith( 'explat_test' )
		) {
			exPlatClient.config.logError( {
				message: '[ExPlat] useExperiment: experimentName should never change between renders!',
			} );
		}

		if ( ! options.isEligible ) {
			return [ false, null ];
		}

		return state;
	};

	const Experiment = ( {
		defaultExperience,
		treatmentExperience,
		loadingExperience,
		name: experimentName,
		options,
	}: {
		defaultExperience: React.ReactNode;
		treatmentExperience: React.ReactNode;
		loadingExperience: React.ReactNode;
		name: string;
		options?: Partial< UseExperimentOptions >;
	} ): JSX.Element => {
		const [ isLoading, experimentAssignment ] = useExperiment( experimentName, options );
		if ( isLoading ) {
			return <>{ loadingExperience }</>;
		} else if ( ! experimentAssignment?.variationName ) {
			return <>{ defaultExperience }</>;
		}
		return <>{ treatmentExperience }</>;
	};

	const ProvideExperimentData = ( {
		children,
		name: experimentName,
		options,
	}: {
		children: (
			isLoading: boolean,
			experimentAssignment: ExperimentAssignment | null
		) => JSX.Element;
		name: string;
		options?: Partial< UseExperimentOptions >;
	} ): JSX.Element => {
		const [ isLoading, experimentAssignment ] = useExperiment( experimentName, options );
		return children( isLoading, experimentAssignment );
	};

	return {
		useExperiment,
		Experiment,
		ProvideExperimentData,
	};
}
