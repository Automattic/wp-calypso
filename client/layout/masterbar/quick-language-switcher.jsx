import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import languages from '@automattic/languages';
import { Fragment, useReducer } from 'react';
import { connect } from 'react-redux';
import LanguagePickerModal from 'calypso/components/language-picker/modal';
import {
	getLanguageEmpathyModeActive,
	toggleLanguageEmpathyMode,
} from 'calypso/lib/i18n-utils/empathy-mode';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import { setLocale } from 'calypso/state/ui/language/actions';
import MasterbarItem from './item';

function QuickLanguageSwitcher( props ) {
	const [ isShowingModal, toggleLanguagesModal ] = useReducer( ( toggled ) => ! toggled, false );
	const onSelected = ( language, { empathyMode, useFallbackForIncompleteLanguages } ) => {
		props.setLocale(
			useFallbackForIncompleteLanguages ? config( 'i18n_default_locale_slug' ) : language.langSlug
		);
		toggleLanguageEmpathyMode( empathyMode );
	};

	return (
		<Fragment>
			{ props.shouldRenderAsButton ? (
				<button className={ props.className } onClick={ toggleLanguagesModal }>
					<Gridicon icon="globe" size={ 24 } />
					{ props.selectedLanguageSlug }
				</button>
			) : (
				<MasterbarItem
					icon="globe"
					className="masterbar__quick-language-switcher"
					onClick={ toggleLanguagesModal }
				>
					{ props.selectedLanguageSlug }
				</MasterbarItem>
			) }
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
	} ),
	{ setLocale }
)( QuickLanguageSwitcher );
