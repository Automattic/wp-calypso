/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import { ActionButtons, BackButton, Title } from '@automattic/onboarding';
import LanguagePicker from '@automattic/language-picker';

/**
 * Internal dependencies
 */
import { ChangeLocaleContextConsumer } from '../../components/locale-context';
import { languages } from '../../../../languages';
import {
	LANGUAGE_GROUPS,
	DEFAULT_LANGUAGE_GROUP,
} from '../../../../components/language-picker/constants';

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
					<div className="language__heading">
						<Title>{ __( 'Select your site language' ) }</Title>
						<ActionButtons>
							<BackButton onClick={ goBack } />
						</ActionButtons>
					</div>
					<LanguagePicker
						languageGroups={ LANGUAGE_GROUPS }
						defaultLananguageGroupId={ DEFAULT_LANGUAGE_GROUP }
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
