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
	defaultOption,
	noticeOperations,
	isSelected,
	shouldUpdateSiteOption
) {
	const [ siteOptions, setSiteOptions ] = useState( {
		option: defaultOption,
		initialOption: '',
		loaded: false,
		isDirty: false,
		isSaving: false,
	} );

	const prevIsSelected = usePrevious( isSelected );
	const prevShouldUpdateSiteOption = usePrevious( shouldUpdateSiteOption );

	useEffect( () => {
		if ( ! siteOptions.loaded ) {
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
					intialOption: result[ siteOption ],
					loaded: true,
				} )
			)
			.catch( ( { message } ) => {
				noticeOperations.createErrorNotice( message );
			} );
	}

	function updateSiteOption() {
		const { option, initialOption } = siteOptions;
		const optionUnchanged = option && option.trim() === initialOption.trim();
		const optionIsEmpty = ! option || option.trim().length === 0;

		// Reset to initial value if user de-selects the block with an empty value.
		if ( ! isSelected && prevIsSelected && optionIsEmpty ) {
			revertOption();
		}

		// Don't do anything further if we shouldn't update the site option or the value is unchanged.
		if ( ! shouldUpdateSiteOption || optionUnchanged ) {
			return;
		}

		if ( ! prevShouldUpdateSiteOption && shouldUpdateSiteOption ) {
			saveSiteOption( option );
		}
	}

	function onSave() {
		const { option, initialOption } = siteOptions;
		const optionUnchanged = option && option.trim() === initialOption.trim();

		if ( optionUnchanged ) {
			setSiteOptions( { ...siteOptions, isDirty: false } );
			return;
		}
		saveSiteOption( option );
	}

	function saveSiteOption( option ) {
		setSiteOptions( { ...siteOptions, isSaving: true } );
		apiFetch( { path: '/wp/v2/settings', method: 'POST', data: { [ siteOption ]: option } } )
			.then( () => updateInitialOption( option ) )
			.catch( ( { message } ) => {
				noticeOperations.createErrorNotice( message );
				revertOption();
			} );
	}

	function revertOption() {
		setSiteOptions( {
			...siteOptions,
			option: siteOptions.initialOption,
			isSaving: false,
		} );
	}

	function updateInitialOption( option ) {
		setSiteOptions( {
			...siteOptions,
			initialOption: option,
			isDirty: false,
			isSaving: false,
		} );
	}

	return { siteOptions, setSiteOptions, onSave };
}
