/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import { ActionButtons, BackButton } from '@automattic/onboarding';
import languages from '@automattic/languages';
import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';

/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ChangeLocaleContextConsumer } from '../../components/locale-context';
import { I18N_STORE } from '../../stores/i18n';
import { PLANS_STORE } from '../../stores/plans';
import { USER_STORE } from '../../stores/user';

/**
 * Style dependencies
 */
import './style.scss';

const LOCALIZED_LANGUAGE_NAMES_FALLBACK_LOCALE = 'en';

const LanguageStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const localizedLanguageNames = useSelect( ( select ) =>
		select( I18N_STORE ).getLocalizedLanguageNames(
			currentUser?.language ?? LOCALIZED_LANGUAGE_NAMES_FALLBACK_LOCALE
		)
	);

	const history = useHistory();

	const { invalidateResolution } = useDispatch( 'core/data' );

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
							// Invalidate the resolution cache for getPrices and getPlansDetails
							// when the locale changes, to force the data for the plans grid
							// to be fetched again, fresh from the plans/details and plans endpoints.
							invalidateResolution( PLANS_STORE, 'getPlansDetails', [ language.langSlug ] );
							invalidateResolution( PLANS_STORE, 'getPrices', [ language.langSlug ] );

							changeLocale( language.langSlug );
							goBack();
						} }
						localizedLanguageNames={ localizedLanguageNames }
					/>
				</div>
			) }
		</ChangeLocaleContextConsumer>
	);
};

export default LanguageStep;
