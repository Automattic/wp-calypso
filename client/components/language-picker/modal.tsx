/**
 * External dependencies
 */
import { Dialog } from '@automattic/components';
import { useI18n } from '@automattic/react-i18n';
import type { I18nReact } from '@automattic/react-i18n';
import LanguagePicker, { createLanguageGroups } from '@automattic/language-picker';
import type { Language, LocalizedLanguageNames } from '@automattic/language-picker';
import React, { useState } from 'react';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import { Button, Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import QueryLanguageNames from 'calypso/components/data/query-language-names';
import FormLabel from 'calypso/components/forms/form-label';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import getLocalizedLanguageNames from 'calypso/state/selectors/get-localized-language-names';
import { isDefaultLocale, isTranslatedIncompletely } from 'calypso/lib/i18n-utils/utils';

/**
 * Style dependencies
 */
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
	__: I18nReact[ '__' ];
	getIncompleteLocaleNoticeMessage: ( ( l: CalypsoLanguage ) => JSX.Element ) | undefined;
};

function IncompleteLocaleNoticeMessage( {
	language,
	__,
	getIncompleteLocaleNoticeMessage: getIncompleteLocaleNoticeMessageProp,
}: IncompleteLocaleNoticeMessageProps ): JSX.Element | null {
	if ( ! language ) {
		return null;
	}

	if ( typeof getIncompleteLocaleNoticeMessageProp === 'function' ) {
		return getIncompleteLocaleNoticeMessageProp( language );
	}

	const { name: languageName, calypsoPercentTranslated: percentTranslated } = language;
	const translateFAQLink = 'https://translate.wordpress.com/faq/';

	return (
		<Tooltip
			position="top center"
			text={
				<div className="language-picker__modal-incomplete-locale-tooltip-text">
					{ __( 'You can help translate WordPress.com into your language.' ) }
					<a href={ translateFAQLink }>{ __( 'Learn more' ) }</a>
				</div>
			}
		>
			<div className="language-picker__modal-incomplete-locale-notice-info">
				{ __( `(${ languageName } is only ${ percentTranslated }% translated)` ) }
				<Icon icon={ info } size={ 20 } />
			</div>
		</Tooltip>
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

	const buttons = [
		<>{ checkboxes }</>,
		<div className="language-picker__modal-buttons">
			<Button isLink onClick={ onClose }>
				{ __( 'Cancel' ) }
			</Button>
			<Button
				isSecondary
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
		</div>,
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
