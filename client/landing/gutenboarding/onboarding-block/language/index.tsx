/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@wordpress/react-i18n';
import { ActionButtons, BackButton } from '@automattic/onboarding';
import languages from '@automattic/languages';
import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import useLastLocation from '../../hooks/use-last-location';

/**
 * Internal dependencies
 */
import { ChangeLocaleContextConsumer } from '../../components/locale-context';
import { I18N_STORE } from '../../stores/i18n';
import { USER_STORE } from '../../stores/user';
import { Step, usePath } from '../../path';
import type { StepNameType } from '../../path';

/**
 * Style dependencies
 */
import './style.scss';

const LOCALIZED_LANGUAGE_NAMES_FALLBACK_LOCALE = 'en';

interface Props {
	previousStep?: StepNameType;
}

const LanguageStep: React.FunctionComponent< Props > = ( { previousStep } ) => {
	const { __ } = useI18n();

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const localizedLanguageNames = useSelect( ( select ) =>
		select( I18N_STORE ).getLocalizedLanguageNames(
			currentUser?.language ?? LOCALIZED_LANGUAGE_NAMES_FALLBACK_LOCALE
		)
	);

	// keep a static reference to the previous step
	const staticPreviousStep = React.useRef( previousStep );

	const history = useHistory();
	const makePath = usePath();
	const { goLastLocation } = useLastLocation();

	const goBack = ( lang = '' ) => {
		staticPreviousStep.current
			? history.push( makePath( Step[ staticPreviousStep.current ], lang ) )
			: goLastLocation();
	};

	return (
		<ChangeLocaleContextConsumer>
			{ ( changeLocale ) => (
				<div className="gutenboarding-page language">
					<LanguagePicker
						headingTitle={ __( 'Select your site language' ) }
						headingButtons={
							<ActionButtons>
								<BackButton onClick={ () => goBack() } />
							</ActionButtons>
						}
						languageGroups={ createLanguageGroups( __ ) }
						languages={ languages }
						onSelectLanguage={ ( language ) => {
							changeLocale( language.langSlug );
							goBack( language.langSlug );
						} }
						localizedLanguageNames={ localizedLanguageNames }
					/>
				</div>
			) }
		</ChangeLocaleContextConsumer>
	);
};

export default LanguageStep;
