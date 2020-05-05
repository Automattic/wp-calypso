/**
 * External dependencies
 */
import React, { Fragment, useReducer } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import LanguagePickerModal from 'components/language-picker/modal';
import { languages } from 'languages';
import { setLocale } from 'state/ui/language/actions';
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';

function QuickLanguageSwitcher( props ) {
	const [ isShowingModal, toggleLanguagesModal ] = useReducer( ( toggled ) => ! toggled, false );
	const onSelected = ( languageSlug ) => props.setLocale( languageSlug );

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
					isVisible
					languages={ languages }
					selected={ props.selectedLanguageSlug }
					onSelected={ onSelected }
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
