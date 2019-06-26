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
	createErrorNotice,
	isSelected,
	shouldUpdateSiteOption
) {
	const [ siteOptions, setSiteOptions ] = useState( {
		option: inititalOption,
		previousOption: '',
		loaded: false,
		isDirty: false,
		isSaving: false,
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
			.catch( () => {
				createErrorNotice( `Unable to load site ${ siteOption }.` );
				setSiteOptions( {
					...siteOptions,
					option: `Error loading site ${ siteOption }`,
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

	function onSave() {
		const { option, previousOption } = siteOptions;
		const optionUnchanged = option && option.trim() === previousOption.trim();

		if ( optionUnchanged ) {
			setSiteOptions( { ...siteOptions, isDirty: false } );
			return;
		}
		saveSiteOption( option );
	}

	function saveSiteOption( option ) {
		setSiteOptions( { ...siteOptions, isSaving: true } );
		apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { [ siteOption ]: option } } )
			.then( () => updatePreviousOption( option ) )
			.catch( () => {
				createErrorNotice( `Unable to save site ${ siteOption }.` );
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

	return { siteOptions, setSiteOptions, onSave };
}
