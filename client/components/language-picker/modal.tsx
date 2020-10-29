/**
 * External dependencies
 */
import React, { ReactNode, useState } from 'react';
import { Dialog } from '@automattic/components';
import { useI18n } from '@automattic/react-i18n';
import LanguagePicker, { Language, createLanguageGroups } from '@automattic/language-picker';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

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
};

const LanguagePickerModal = ( {
	languages,
	onClose,
	onSelectLanguage,
	selectedLanguageSlug,
}: Props ): ReactNode => {
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
			<LanguagePicker
				title={ __( 'Select a language' ) }
				languages={ languages }
				languageGroups={ createLanguageGroups( __ ) }
				onSelectLanguage={ setSelectedLanguage }
				selectedLanguage={ selectedLanguage }
			/>
		</Dialog>
	);
};

export default LanguagePickerModal;
