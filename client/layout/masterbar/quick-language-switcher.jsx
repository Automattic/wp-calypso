/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import LanguagePickerModal from 'components/language-picker/modal';
import switchLocale from 'lib/i18n-utils/switch-locale';
import config from 'config';

class QuickLanguageSwitcher extends React.Component {
	state = {
		isShowingModal: false,
	};

	toggleLanguagesModal = () => this.setState( { isShowingModal: ! this.state.isShowingModal } );

	onClick = event => {
		this.toggleLanguagesModal();
		event.preventDefault();
	};

	onSelected = languageSlug => switchLocale( languageSlug );

	render() {
		const selectedLanguageSlug = getLocaleSlug();

		return (
			<div className="masterbar__item masterbar__quick-language-switcher">
				<MasterbarItem icon="globe" onClick={ this.onClick }>
					{ selectedLanguageSlug }
				</MasterbarItem>

				<LanguagePickerModal
					isVisible={ this.state.isShowingModal }
					languages={ config( 'languages' ) }
					selected={ selectedLanguageSlug }
					onSelected={ this.onSelected }
					onClose={ this.toggleLanguagesModal }
				/>
			</div>
		);
	}
}

export default QuickLanguageSwitcher;
