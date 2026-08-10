import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';
import languages from '@automattic/languages';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useLocaleSlug } from '../locale';
import { setSessionLocale } from '../locale/session-locale';
import type { Language } from '@automattic/languages';

import './omnibar-language-switcher-modal.scss';

export default function OmnibarLanguageSwitcherModal( { onClose }: { onClose: () => void } ) {
	const currentLocale = useLocaleSlug();

	const [ selectedLanguage, setSelectedLanguage ] = useState< Language | undefined >( () =>
		languages.find( ( { langSlug } ) => langSlug === currentLocale )
	);

	const languageGroups = useMemo( () => createLanguageGroups( __ ), [] );

	const apply = ( locale: string ) => {
		setSessionLocale( locale );
		window.location.reload();
	};

	return (
		<Modal
			title={ __( 'Select a language' ) }
			className="omnibar-language-switcher-modal"
			size="large"
			onRequestClose={ onClose }
		>
			<VStack spacing={ 4 } className="omnibar-language-switcher-content">
				<div className="omnibar-language-switcher-body">
					<LanguagePicker
						headingTitle
						languages={ languages }
						languageGroups={ languageGroups }
						selectedLanguage={ selectedLanguage }
						onSelectLanguage={ setSelectedLanguage }
					/>
				</div>
				<HStack
					justify="flex-end"
					spacing={ 2 }
					expanded={ false }
					className="omnibar-language-switcher-footer"
				>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						accessibleWhenDisabled
						disabled={ ! selectedLanguage || selectedLanguage.langSlug === currentLocale }
						onClick={ () => selectedLanguage && apply( selectedLanguage.langSlug ) }
					>
						{ __( 'Apply' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
