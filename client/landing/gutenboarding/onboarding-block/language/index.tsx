/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import { ActionButtons, BackButton } from '@automattic/onboarding';
import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';

/**
 * Internal dependencies
 */
import { ChangeLocaleContextConsumer } from '../../components/locale-context';
import languages from '@automattic/languages';

/**
 * Style dependencies
 */
import './style.scss';

const LanguageStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	const history = useHistory();

	const goBack = () => {
		history.goBack();
	};

	return (
		<ChangeLocaleContextConsumer>
			{ ( changeLocale ) => (
				<div className="gutenboarding-page language">
					<LanguagePicker
						headingTitle={ __( 'Select your site language' ) }
						headingButtons={
							<ActionButtons>
								<BackButton onClick={ goBack } />
							</ActionButtons>
						}
						languageGroups={ createLanguageGroups( __ ) }
						languages={ languages }
						onSelectLanguage={ ( language ) => {
							changeLocale( language.langSlug );
							goBack();
						} }
					/>
				</div>
			) }
		</ChangeLocaleContextConsumer>
	);
};

export default LanguageStep;
