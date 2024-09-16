import { useSearchParams } from 'react-router-dom';
import { Primitive } from 'utility-types';
import { addQueryArgs } from 'calypso/lib/url';
import { Navigate, ProvidedDependencies, StepperStep } from '../../internals/types';

interface Options {
	navigate: Navigate< StepperStep[] >;
	persistedUrlParams: string[];
}

/**
 * Custom hook for managing navigation within a flow, handling query parameters and step transitions.
 * @param {Object} options - Configuration options for the hook.
 * @param {Navigate<StepperStep[]>} options.navigate - Function to navigate between steps.
 * @param {string[]} options.persistedUrlParams - Array of URL parameter keys to persist across navigation.
 * @returns {Object} An object containing utility functions for flow navigation.
 * @returns {Function} .getFromPropsOrUrl - Retrieves a value from props or URL query parameters.
 * @returns {Function} .navigateWithQueryParams - Navigates to a step while managing query parameters.
 * @example
 * const { navigateWithQueryParams, getFromPropsOrUrl } = useFlowNavigator({
 *   navigate: stepNavigationFunction,
 *   persistedUrlParams: ['siteId', 'plan']
 * });
 */

export const useFlowNavigator = ( { navigate, persistedUrlParams }: Options ) => {
	const [ query ] = useSearchParams();

	/**
	 * Retrieves a value from either the provided props or the current URL query parameters.
	 * @param {string} key - The key to look for in props or URL query parameters.
	 * @param {ProvidedDependencies} [props] - Optional object containing provided dependencies.
	 * @returns {Primitive | undefined} The value associated with the key, or undefined if not found or if the value is an object.
	 *
	 * This function first checks if the key exists in the provided props. If not found or if props are not provided,
	 * it then looks for the key in the current URL query parameters. If the value is found but is an object,
	 * the function returns undefined. This ensures that only primitive values are returned.
	 */
	const getFromPropsOrUrl = ( key: string, props?: ProvidedDependencies ): Primitive => {
		const value = props?.[ key ] || query.get( key );
		return typeof value === 'object' ? undefined : ( value as Primitive );
	};

	/**
	 * Navigates to a specified step while preserving and updating query parameters.
	 * @param {StepperStep} step - The step to navigate to.
	 * @param {string[]} [keys] - Additional query parameter keys to include.
	 * @param {ProvidedDependencies} [props] - Additional properties to consider for query params.
	 * @param {Object} [options] - Navigation options.
	 * @param {boolean} options.replaceHistory - If true, replaces the current history entry instead of adding a new one.
	 * @returns {void}
	 *
	 * This function combines persisted URL parameters with additional specified keys,
	 * retrieves their values from either props or the current URL, and navigates to
	 * the given step with these parameters included in the URL.
	 */
	const navigateWithQueryParams = (
		step: StepperStep,
		keys: string[] = [],
		props: ProvidedDependencies = {},
		options = { replaceHistory: false }
	) => {
		const allKeys = [ ...persistedUrlParams, ...keys ];

		const queryParams = allKeys.reduce(
			( acc, key ) => {
				const value = getFromPropsOrUrl( key, props );
				if ( value ) {
					acc[ key ] = value;
				}
				return acc;
			},
			{} as Record< string, Primitive >
		);

		return navigate( addQueryArgs( queryParams, step.slug ), {}, options.replaceHistory );
	};

	return {
		navigateWithQueryParams,
		getFromPropsOrUrl,
	};
};
