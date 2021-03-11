/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';

/**
 * WordPress dependencies
 */
import type { ExPlatClient, ExperimentAssignment } from '@automattic/explat-client';

interface ExPlatClientReactHelpers {
	/**
	 * An ExPlat useExperiment hook.
	 *
	 * NOTE: Doesn't obey ExperimentAssignment TTL in order to keep stable UX.
	 *
	 * @returns [isExperimentAssignmentLoading, ExperimentAssignment | null]
	 */
	useExperiment: ( experimentName: string ) => [ boolean, ExperimentAssignment | null ];

	/**
	 * Experiment component, safest and simplest, should be first choice if usable.
	 */
	Experiment: ( props: {
		name: string;
		default: React.ReactNode;
		treatment: React.ReactNode;
		loading: React.ReactNode;
	} ) => JSX.Element;
}

export default function createExPlatClientReactHelpers(
	exPlatClient: ExPlatClient
): ExPlatClientReactHelpers {
	const useExperiment = ( experimentName: string ): [ boolean, ExperimentAssignment | null ] => {
		const [ previousExperimentName ] = useState( experimentName );
		const [ isLoading, setIsLoading ] = useState< boolean >( true );
		const [
			experimentAssignment,
			setExperimentAssignment,
		] = useState< ExperimentAssignment | null >( null );

		useEffect( () => {
			let isSubscribed = true;
			exPlatClient.loadExperimentAssignment( experimentName ).then( ( experimentAssignment ) => {
				if ( isSubscribed ) {
					setExperimentAssignment( experimentAssignment );
					setIsLoading( false );
				}
			} );
			return () => {
				isSubscribed = false;
			};
			// We don't expect experimentName to ever change and if it does we want to assignment to stay constant.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [] );

		if (
			experimentName !== previousExperimentName &&
			! previousExperimentName.startsWith( 'explat_test' )
		) {
			const message = '[ExPlat] useExperiment: experimentName should never change between renders!';
			if ( exPlatClient.config.isDevelopmentMode ) {
				throw new Error( message );
			}
			exPlatClient.config.logError( { message } );
		}

		return [ isLoading, experimentAssignment ];
	};

	const Experiment = ( {
		// As default is a keyword:
		default: defaultExperience,
		treatment,
		loading,
		name: experimentName,
	}: {
		default: React.ReactNode;
		treatment: React.ReactNode;
		loading: React.ReactNode;
		name: string;
	} ): JSX.Element => {
		const [ isLoading, experimentAssignment ] = useExperiment( experimentName );
		if ( isLoading ) {
			return <>{ loading }</>;
		} else if ( ! experimentAssignment?.variationName ) {
			return <>{ defaultExperience }</>;
		}
		return <>{ treatment }</>;
	};

	return {
		useExperiment,
		Experiment,
	};
}
