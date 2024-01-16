/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store';
/**
 * Types
 */
import type { Selectors } from '../store/types';

const useFetchErrors = () => {
	const {
		setFeatureFetchError,
		setFirstLogoPromptFetchError,
		setEnhancePromptFetchError,
		setLogoFetchError,
	} = useDispatch( STORE_NAME );

	const { featureFetchError, firstLogoPromptFetchError, enhancePromptFetchError, logoFetchError } =
		useSelect( ( select ) => {
			const selectors: Selectors = select( STORE_NAME );

			return {
				featureFetchError: selectors.getFeatureFetchError(),
				firstLogoPromptFetchError: selectors.getFirstLogoPromptFetchError(),
				enhancePromptFetchError: selectors.getEnhancePromptFetchError(),
				logoFetchError: selectors.getLogoFetchError(),
			};
		}, [] );

	return {
		setFeatureFetchError,
		setFirstLogoPromptFetchError,
		setEnhancePromptFetchError,
		setLogoFetchError,
		featureFetchError,
		firstLogoPromptFetchError,
		enhancePromptFetchError,
		logoFetchError,
	};
};

export default useFetchErrors;
