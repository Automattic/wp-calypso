/**
 * External dependencies
 */
import { Dialog } from '@automattic/components';
import { useI18n } from '@automattic/react-i18n';
import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';
import type { Language, LocalizedLanguageNames } from '@automattic/language-picker';
import React, { useState } from 'react';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';

/**
 * Style dependencies
 */
import './modal.scss';

type Props = {
	languages: Language[];
	/**
	 * Fires when the modal is dismissed.
	 */
	onClose: () => void;
	/**
	 * Fires when the modal is dismissed with a language selection.
	 */
	onSelectLanguage: ( l: Language ) => void;
	selectedLanguageSlug?: string;
	localizedLanguageNames: LocalizedLanguageNames;
};

const LanguagePickerModal: React.FC< Props > = ( {
	languages,
	onClose,
	onSelectLanguage,
	selectedLanguageSlug,
	localizedLanguageNames,
} ) => {
	const { __ } = useI18n();
	const [ selectedLanguage, setSelectedLanguage ] = useState< Language | undefined >(
		languages.find( ( l ) => l.langSlug === selectedLanguageSlug )
	);

	const buttons = [
		<Button isLink isLarge onClick={ onClose }>
			{ __( 'Cancel' ) }
		</Button>,
		<Button
			isSecondary
			isLarge
			onClick={ () => {
				onClose();
				if ( selectedLanguage ) {
					onSelectLanguage( selectedLanguage );
				}
			} }
		>
			{ __( 'Apply Changes' ) }
		</Button>,
	];

	return (
		<Dialog
			isVisible
			onClose={ onClose }
			buttons={ buttons }
			additionalClassNames="language-picker__dialog"
		>
			<QueryLanguageNames />
			<LanguagePicker
				headingTitle={ __( 'Select a language' ) }
				languages={ languages }
				languageGroups={ createLanguageGroups( __ ) }
				onSelectLanguage={ setSelectedLanguage }
				selectedLanguage={ selectedLanguage }
				localizedLanguageNames={ localizedLanguageNames }
			/>
		</Dialog>
	);
};

export default connect( ( state ) => ( {
	localizedLanguageNames: getLocalizedLanguageNames( state ) as LocalizedLanguageNames,
} ) )( LanguagePickerModal );
