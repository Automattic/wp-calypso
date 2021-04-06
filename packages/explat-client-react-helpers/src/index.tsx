/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

/**
 * WordPress dependencies
 */
import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client';

interface ExperimentOptions {
	/**
	 * Determines whether a participant is currenlty eligible for an assignment.
	 * - Only loads the experimentAssignment if isEligible is true.
	 * - Only returns the experimentAssignment if isEligible is true.
	 */
	isEligible: boolean;
}

const defaultExperimentOptions: ExperimentOptions = {
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
		options?: Partial< ExperimentOptions >
	) => [ boolean, ExperimentAssignment | null ];

	/**
	 * Experiment component, safest and simplest, should be first choice if usable.
	 */
	Experiment: ( props: {
		name: string;
		defaultExperience: React.ReactNode;
		treatmentExperience: React.ReactNode;
		loadingExperience: React.ReactNode;
		options?: Partial< ExperimentOptions >;
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
		options?: Partial< ExperimentOptions >;
	} ) => JSX.Element;
}

export default function createExPlatClientReactHelpers(
	exPlatClient: ExPlatClient
): ExPlatClientReactHelpers {
	const useExperiment = (
		experimentName: string,
		providedOptions: Partial< ExperimentOptions > = {}
	): [ boolean, ExperimentAssignment | null ] => {
		const options: ExperimentOptions = { ...defaultExperimentOptions, ...providedOptions };

		const [ previousExperimentName ] = useState( experimentName );
		const [ state, setState ] = useState< [ boolean, ExperimentAssignment | null ] >( [
			true,
			null,
		] );

		useEffect( () => {
			let isSubscribed = true;
			if ( options.isEligible ) {
				exPlatClient.loadExperimentAssignment( experimentName ).then( ( experimentAssignment ) => {
					if ( isSubscribed ) {
						setState( [ false, experimentAssignment ] );
					}
				} );
			}
			return () => {
				isSubscribed = false;
			};
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
		options?: Partial< ExperimentOptions >;
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
		options?: Partial< ExperimentOptions >;
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
