import { useRef, useEffect, useReducer } from 'react';
import * as React from 'react';
import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client';

export interface ExperimentOptions {
	/**
	 * Determines whether a participant is currenlty eligible for an assignment.
	 * - Only loads the experimentAssignment if isEligible is true.
	 * - Only returns the experimentAssignment if isEligible is true.
	 */
	isEligible?: boolean;
}

const defaultExperimentOptions = {
	isEligible: true,
};

export interface ExPlatClientReactHelpers {
	/**
	 * An ExPlat useExperiment hook.
	 *
	 * NOTE: Doesn't obey ExperimentAssignment TTL in order to keep stable UX.
	 * @returns [isExperimentAssignmentLoading, ExperimentAssignment | null]
	 */
	useExperiment: (
		experimentName: string,
		options?: ExperimentOptions
	) => [ boolean, ExperimentAssignment | null ];

	/**
	 * Experiment component, safest and simplest, should be first choice if usable.
	 */
	Experiment: ( props: {
		name: string;
		defaultExperience: React.ReactNode;
		treatmentExperience: React.ReactNode;
		loadingExperience: React.ReactNode;
		options?: ExperimentOptions;
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
		options?: ExperimentOptions;
	} ) => JSX.Element;
}

export default function createExPlatClientReactHelpers(
	exPlatClient: ExPlatClient
): ExPlatClientReactHelpers {
	const useExperiment = (
		experimentName: string,
		providedOptions: ExperimentOptions = {}
	): [ boolean, ExperimentAssignment | null ] => {
		const options: Required< ExperimentOptions > = {
			...defaultExperimentOptions,
			...providedOptions,
		};

		// Manual updates to ensure rerendering when we want it:
		// https://legacy.reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
		const [ , forceUpdate ] = useReducer( ( x ) => x + 1, 0 );
		const previousExperimentNameRef = useRef( experimentName );

		useEffect( () => {
			let isSubscribed = true;
			if ( options.isEligible ) {
				exPlatClient.loadExperimentAssignment( experimentName ).then( () => {
					if ( isSubscribed ) {
						forceUpdate();
					}
				} );
			}
			return () => {
				isSubscribed = false;
			};
		}, [ experimentName, options.isEligible ] );

		if (
			experimentName !== previousExperimentNameRef.current &&
			! previousExperimentNameRef.current.startsWith( 'explat_test' )
		) {
			exPlatClient.config.logError( {
				message: '[ExPlat] useExperiment: experimentName should never change between renders!',
			} );
		}

		if ( ! options.isEligible ) {
			return [ false, null ];
		}

		const maybeExperimentAssignment =
			exPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment( experimentName );
		return [ ! maybeExperimentAssignment, maybeExperimentAssignment ];
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
		options?: ExperimentOptions;
	} ) => {
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
		options?: ExperimentOptions;
	} ) => {
		const [ isLoading, experimentAssignment ] = useExperiment( experimentName, options );
		return children( isLoading, experimentAssignment );
	};

	return {
		useExperiment,
		Experiment,
		ProvideExperimentData,
	};
}
