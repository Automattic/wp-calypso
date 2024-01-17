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

const useRequestErrors = () => {
	const {
		setFeatureFetchError,
		setFirstLogoPromptFetchError,
		setEnhancePromptFetchError,
		setLogoFetchError,
		setSaveToLibraryError,
		setLogoUpdateError,
	} = useDispatch( STORE_NAME );

	const {
		featureFetchError,
		firstLogoPromptFetchError,
		enhancePromptFetchError,
		logoFetchError,
		saveToLibraryError,
		logoUpdateError,
	} = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );

		return {
			featureFetchError: selectors.getFeatureFetchError(),
			firstLogoPromptFetchError: selectors.getFirstLogoPromptFetchError(),
			enhancePromptFetchError: selectors.getEnhancePromptFetchError(),
			logoFetchError: selectors.getLogoFetchError(),
			saveToLibraryError: selectors.getSaveToLibraryError(),
			logoUpdateError: selectors.getLogoUpdateError(),
		};
	}, [] );

	const clearErrors = () => {
		setFeatureFetchError( null );
		setFirstLogoPromptFetchError( null );
		setEnhancePromptFetchError( null );
		setLogoFetchError( null );
		setSaveToLibraryError( null );
		setLogoUpdateError( null );
	};

	return {
		setFeatureFetchError,
		setFirstLogoPromptFetchError,
		setEnhancePromptFetchError,
		setLogoFetchError,
		setSaveToLibraryError,
		setLogoUpdateError,
		clearErrors,
		featureFetchError,
		firstLogoPromptFetchError,
		enhancePromptFetchError,
		logoFetchError,
		saveToLibraryError,
		logoUpdateError,
	};
};

export default useRequestErrors;
