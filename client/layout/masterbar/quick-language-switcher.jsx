import config from '@automattic/calypso-config';
import languages from '@automattic/languages';
import { Fragment, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LanguagePickerModal from 'calypso/components/language-picker/modal';
import {
	getLanguageEmpathyModeActive,
	toggleLanguageEmpathyMode,
} from 'calypso/lib/i18n-utils/empathy-mode';
import { switchLocale } from 'calypso/lib/i18n-utils/switch-locale';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import MasterbarItem from './item';

export default function QuickLanguageSwitcher() {
	const dispatch = useDispatch();
	const selectedLanguageSlug = useSelector( getCurrentLocaleSlug );
	const [ isShowingModal, toggleLanguagesModal ] = useReducer( ( toggled ) => ! toggled, false );
	const onSelected = ( language, { empathyMode, useFallbackForIncompleteLanguages } ) => {
		dispatch(
			switchLocale(
				useFallbackForIncompleteLanguages ? config( 'i18n_default_locale_slug' ) : language.langSlug
			)
		);
		toggleLanguageEmpathyMode( empathyMode );
	};

	return (
		<Fragment>
			<MasterbarItem
				icon="globe"
				className="masterbar__quick-language-switcher"
				onClick={ toggleLanguagesModal }
			>
				{ selectedLanguageSlug }
			</MasterbarItem>
			{ isShowingModal && (
				<LanguagePickerModal
					languages={ languages }
					selectedLanguageSlug={ selectedLanguageSlug }
					empathyMode={ getLanguageEmpathyModeActive() }
					showEmpathyModeControl
					onSelectLanguage={ onSelected }
					onClose={ toggleLanguagesModal }
				/>
			) }
		</Fragment>
	);
}
