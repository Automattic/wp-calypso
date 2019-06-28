/**
 * External dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import usePrevious from './usePrevious';

export default function useSiteOptions(
	siteOption,
	inititalOption,
	noticeOperations,
	isSelected,
	shouldUpdateSiteOption,
	setAttributes
) {
	const [ siteOptions, setSiteOptions ] = useState( {
		option: inititalOption,
		previousOption: '',
		loaded: false,
		error: false,
	} );

	const previousIsSelected = usePrevious( isSelected );
	const previousShouldUpdateSiteOption = usePrevious( shouldUpdateSiteOption );

	useEffect( () => {
		if ( ! siteOptions.loaded && ! siteOptions.error ) {
			loadSiteOption();
		} else {
			updateSiteOption();
		}
	} );

	function loadSiteOption() {
		apiFetch( { path: '/wp/v2/settings' } )
			.then( result =>
				setSiteOptions( {
					...siteOptions,
					option: result[ siteOption ],
					previousOption: result[ siteOption ],
					loaded: true,
					error: false,
				} )
			)
			.catch( ( { message } ) => {
				noticeOperations.createErrorNotice( message );
				setSiteOptions( {
					...siteOptions,
					error: true,
				} );
			} );
	}

	function updateSiteOption() {
		const { option, previousOption } = siteOptions;
		const optionUnchanged = option && option.trim() === previousOption.trim();
		const optionIsEmpty = ! option || option.trim().length === 0;

		// Reset to initial value if user de-selects the block with an empty value.
		if ( ! isSelected && previousIsSelected && optionIsEmpty ) {
			revertOption();
		}

		// Don't do anything further if we shouldn't update the site option or the value is unchanged.
		if ( ! shouldUpdateSiteOption || optionUnchanged ) {
			return;
		}

		if ( ! previousShouldUpdateSiteOption && shouldUpdateSiteOption ) {
			saveSiteOption( option );
		}
	}

	function saveSiteOption( option ) {
		setSiteOptions( { ...siteOptions, isSaving: true } );
		apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { [ siteOption ]: option } } )
			.then( () => updatePreviousOption( option ) )
			.catch( ( { message } ) => {
				noticeOperations.createErrorNotice( message );
				revertOption();
			} );
	}

	function revertOption() {
		setSiteOptions( {
			...siteOptions,
			option: siteOptions.previousOption,
			isSaving: false,
		} );
	}

	function updatePreviousOption( option ) {
		setSiteOptions( {
			...siteOptions,
			previousOption: option,
			isDirty: false,
			isSaving: false,
		} );
	}

	function handleChange( value ) {
		// The following is a temporary fix. Setting this fake attribute is used to flag
		// the content as dirty to editor and enable Update/Publish button. This should be
		// removed once updating of site options handled in core editor
		setAttributes( { updated: Date.now() } );
		setSiteOptions( { ...siteOptions, option: value } );
	}

	return { siteOptions, handleChange };
}
