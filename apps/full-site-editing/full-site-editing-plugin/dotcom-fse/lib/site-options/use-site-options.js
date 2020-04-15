/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import { usePrevious } from './use-previous';

export function useSiteOptions(
	siteOption,
	inititalOption,
	createErrorNotice,
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
			.then( ( result ) =>
				setSiteOptions( {
					...siteOptions,
					option: decodeEntities( result[ siteOption ] ),
					previousOption: decodeEntities( result[ siteOption ] ),
					loaded: true,
					error: false,
				} )
			)
			.catch( () => {
				createErrorNotice( sprintf( __( 'Unable to load site %s' ), siteOption ) );
				setSiteOptions( {
					...siteOptions,
					option: sprintf( __( 'Error loading site %s' ), siteOption ),
					error: true,
				} );
			} );
	}

	function updateSiteOption() {
		const { option, previousOption } = siteOptions;

		/**
		 * 1. Both `previousOption` and `option` are falsey.
		 * OR
		 * 2. Both `previousOption` and `option` are the same value after trim.
		 */
		const optionUnchanged =
			( ! previousOption && ! option ) ||
			( option && previousOption && option.trim() === previousOption.trim() );
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
			.catch( () => {
				createErrorNotice( sprintf( __( 'Unable to save site %s' ), siteOption ) );
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
