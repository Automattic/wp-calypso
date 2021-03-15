/**
 * External dependencies
 */
import React, { Fragment, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import config from '@automattic/calypso-config';
import MasterbarItem from './item';
import LanguagePickerModal from 'calypso/components/language-picker/modal';
import languages from '@automattic/languages';
import { setLocale } from 'calypso/state/ui/language/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import {
	getLanguageEmpathyModeActive,
	toggleLanguageEmpathyMode,
} from 'calypso/lib/i18n-utils/empathy-mode';

function QuickLanguageSwitcher( props ) {
	const [ isShowingModal, toggleLanguagesModal ] = useReducer( ( toggled ) => ! toggled, false );
	const onSelected = ( language, { empathyMode, useFallbackForIncompleteLanguages } ) => {
		props.setLocale(
			useFallbackForIncompleteLanguages ? config( 'i18n_default_locale_slug' ) : language.langSlug
		);
		toggleLanguageEmpathyMode( empathyMode );
	};

	// After changing the language, the menu should be requested again so that items are fetched with the current locale.
	useEffect( () => {
		props.requestAdminMenu( props.selectedSiteId );
	}, [ props.locale ] );

	return (
		<Fragment>
			<MasterbarItem
				icon="globe"
				className="masterbar__quick-language-switcher"
				onClick={ toggleLanguagesModal }
			>
				{ props.selectedLanguageSlug }
			</MasterbarItem>
			{ isShowingModal && (
				<LanguagePickerModal
					languages={ languages }
					selectedLanguageSlug={ props.selectedLanguageSlug }
					empathyMode={ getLanguageEmpathyModeActive() }
					showEmpathyModeControl
					onSelectLanguage={ onSelected }
					onClose={ toggleLanguagesModal }
				/>
			) }
		</Fragment>
	);
}

export default connect(
	( state ) => ( {
		selectedLanguageSlug: getCurrentLocaleSlug( state ),
		selectedSiteId: getSelectedSiteId( state ),
	} ),
	{ setLocale, requestAdminMenu }
)( localize( QuickLanguageSwitcher ) );
