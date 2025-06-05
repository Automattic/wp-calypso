import { FormLabel, MaterialIcon } from '@automattic/components';
import { isDefaultLocale, isTranslatedIncompletely } from '@automattic/i18n-utils';
import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';
import { Modal, Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import { IAppState } from 'calypso/state/types';
import type { Language, LocalizedLanguageNames } from '@automattic/language-picker';
import type { I18n } from '@wordpress/i18n';
import './modal.scss';

type CalypsoLanguage = Language & {
	calypsoPercentTranslated: number;
	isTranslatedCompletely: boolean;
};

type Props = {
	languages: CalypsoLanguage[];
	/**
	 * Fires when the modal is dismissed.
	 */
	onClose: () => void;
	/**
	 * Fires when the modal is dismissed with a language selection.
	 */
	onSelectLanguage: (
		l: CalypsoLanguage,
		extraOptions: { empathyMode: boolean; useFallbackForIncompleteLanguages: boolean }
	) => void;
	selectedLanguageSlug?: string;
	localizedLanguageNames: LocalizedLanguageNames;
	empathyMode?: boolean;
	useFallbackForIncompleteLanguages?: boolean;
	showEmpathyModeControl?: boolean;
	getIncompleteLocaleNoticeMessage?: ( l: CalypsoLanguage ) => string;
};

type IncompleteLocaleNoticeMessageProps = {
	language: CalypsoLanguage | undefined;
	__: I18n[ '__' ];
	getIncompleteLocaleNoticeMessage: ( ( l: CalypsoLanguage ) => JSX.Element ) | undefined;
};

function IncompleteLocaleNoticeMessage( {
	language,
	__,
	getIncompleteLocaleNoticeMessage: getIncompleteLocaleNoticeMessageProp,
}: IncompleteLocaleNoticeMessageProps ) {
	if ( ! language ) {
		return null;
	}

	if ( typeof getIncompleteLocaleNoticeMessageProp === 'function' ) {
		return getIncompleteLocaleNoticeMessageProp( language );
	}

	const { name: languageName, calypsoPercentTranslated: percentTranslated } = language;
	return (
		<div className="language-picker__modal-incomplete-locale-notice-info">
			{
				/* translators: %(languageName)s is a localized language name, %(percentTranslated)d%% is a percentage number (0-100), followed by an escaped percent sign %%. */
				sprintf( __( '(%(languageName)s is only %(percentTranslated)d%% translated)' ), {
					languageName,
					percentTranslated,
				} )
			}
		</div>
	);
}

const LanguagePickerModal: React.FC< Props > = ( {
	languages,
	onClose,
	onSelectLanguage,
	selectedLanguageSlug: selectedLanguageSlugProp,
	localizedLanguageNames,
	showEmpathyModeControl = false,
	empathyMode: initialEmapthyModeValue = false,
	useFallbackForIncompleteLanguages: initialUseFallbackForIncompleteLanguages = false,
	getIncompleteLocaleNoticeMessage: getIncompleteLocaleNoticeMessageProp,
} ) => {
	const { __ } = useI18n();
	const [ selectedLanguage, setSelectedLanguage ] = useState< CalypsoLanguage | undefined >(
		languages.find( ( l ) => l.langSlug === selectedLanguageSlugProp )
	);
	const [ empathyMode, setEmpathyMode ] = useState( initialEmapthyModeValue );
	const [ useFallbackForIncompleteLanguages, setUseFallbackForIncompleteLanguages ] = useState(
		initialUseFallbackForIncompleteLanguages
	);
	const recordClick = () =>
		selectedLanguage
			? recordTracksEvent( 'calypso_translator_invitation', {
					language: localizedLanguageNames[ selectedLanguage.langSlug ].en,
					location: '/me/account',
			  } )
			: null;

	const selectedLanguageSlug = selectedLanguage && selectedLanguage.langSlug;

	const isDefaultLanguageSelected = selectedLanguageSlug && isDefaultLocale( selectedLanguageSlug );
	const showIncompleteLocaleControl =
		! isDefaultLanguageSelected &&
		selectedLanguageSlug &&
		isTranslatedIncompletely( selectedLanguageSlug );

	const showCheckboxes = showEmpathyModeControl || showIncompleteLocaleControl;
	const checkboxes = showCheckboxes ? (
		<div className="language-picker__modal-checkboxes">
			{ showIncompleteLocaleControl && (
				<div className="language-picker__modal-locale-notice">
					{ ! getIncompleteLocaleNoticeMessageProp && (
						<FormLabel>
							<FormCheckbox
								checked={ useFallbackForIncompleteLanguages }
								onChange={ ( e ) => setUseFallbackForIncompleteLanguages( e.target.checked ) }
							/>
							<span>
								<span className="language-picker__modal-incomplete-locale-text">
									{ __( 'Display interface in English' ) }
								</span>
								<span className="language-picker__modal-incomplete-locale-notice">
									<IncompleteLocaleNoticeMessage
										language={ selectedLanguage }
										__={ __ }
										getIncompleteLocaleNoticeMessage={ getIncompleteLocaleNoticeMessageProp }
									/>
								</span>
							</span>
						</FormLabel>
					) }
					<div className="language-picker__modal-incomplete-locale-nudge-text">
						<MaterialIcon icon="emoji_language" />
						<span>
							{ __( 'You can help translate WordPress.com into your language.' ) }{ ' ' }
							<a
								className="language-picker__modal-incomplete-locale-nudge-link"
								href="https://translate.wordpress.com/faq/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ recordClick }
							>
								{ __( 'Learn more' ) }
							</a>
						</span>
					</div>
				</div>
			) }
			{ showEmpathyModeControl && (
				<div className="language-picker__modal-empathy-mode">
					<FormLabel>
						<FormCheckbox
							checked={ empathyMode && ! isDefaultLanguageSelected }
							disabled={ !! isDefaultLanguageSelected }
							onChange={ ( e ) => setEmpathyMode( e.target.checked ) }
						/>
						<span title="Pretend to use that language but display English where a translated exists">
							Empathy mode (a8c only)
						</span>
					</FormLabel>
				</div>
			) }
		</div>
	) : null;

	const buttons = (
		<>
			<>{ checkboxes }</>
			<div className="language-picker__modal-buttons">
				<Button variant="link" onClick={ onClose }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => {
						onClose();
						if ( selectedLanguage ) {
							onSelectLanguage( selectedLanguage, {
								empathyMode,
								useFallbackForIncompleteLanguages,
							} );
						}
					} }
				>
					{ __( 'Apply Changes' ) }
				</Button>
			</div>
		</>
	);

	return (
		<Modal
			onRequestClose={ onClose }
			className="language-picker-modal__wrapper"
			size="large"
			title={ __( 'Select a language' ) }
		>
			<div className="language-picker-modal__content">
				<div className="language-picker-modal__body">
					<QueryLanguageNames />
					<LanguagePicker
						headingTitle
						languages={ languages }
						languageGroups={ createLanguageGroups( __ ) }
						onSelectLanguage={ setSelectedLanguage }
						selectedLanguage={ selectedLanguage }
						localizedLanguageNames={ localizedLanguageNames }
					/>
				</div>
				<div className="language-picker-modal__footer">{ buttons }</div>
			</div>
		</Modal>
	);
};

export default connect(
	( state: IAppState ) => ( {
		localizedLanguageNames: getLocalizedLanguageNames( state ) as LocalizedLanguageNames,
	} ),
	{ recordTracksEvent }
)( LanguagePickerModal );
