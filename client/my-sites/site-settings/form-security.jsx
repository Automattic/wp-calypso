/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flow, includes, isEmpty, partialRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';
import { Button, TextControl, Panel, PanelBody, PanelRow } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import wrapSettingsForm from './wrap-settings-form';
import Protect from './protect';
import Sso from './sso';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import FormInputValidation from 'components/forms/form-input-validation';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackSettingsSaveFailure from 'state/selectors/is-jetpack-settings-save-failure';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import { isATEnabled } from 'lib/automated-transfer';
import { FEATURE_SPAM_AKISMET_PLUS, PLAN_JETPACK_PERSONAL } from 'lib/plans/constants';

class SiteSettingsFormSecurity extends Component {
	render() {
		const {
			akismetUnavailable,
			dirtyFields,
			fields,
			handleAutosavingToggle,
			handleSubmitForm,
			hasAkismetFeature,
			hasAkismetKeyError,
			isAtomic,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			protectModuleActive,
			protectModuleUnavailable,
			setFieldValue,
			settings,
			siteId,
			translate,
		} = this.props;
		const disableProtect = ! protectModuleActive || protectModuleUnavailable;
		const disableSpamFiltering = ! fields.akismet || akismetUnavailable;

		const inTransition = isRequestingSettings || isSavingSettings;
		const isStoredKey = fields.wordpress_api_key === settings.wordpress_api_key;
		const isDirty = includes( dirtyFields, 'wordpress_api_key' );
		const isEmptyKey = isEmpty( fields.wordpress_api_key ) || isEmpty( settings.wordpress_api_key );
		const isValidKey =
			( fields.wordpress_api_key && isStoredKey ) ||
			( fields.wordpress_api_key && isDirty && isStoredKey && ! hasAkismetKeyError );
		const isInvalidKey = ( isDirty && hasAkismetKeyError && ! isStoredKey ) || isEmptyKey;

		let fieldStyle;
		if ( ! inTransition && isValidKey ) {
			fieldStyle = 'is-valid';
		}

		if ( ! inTransition && isInvalidKey ) {
			fieldStyle = 'is-error';
		}

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__security-settings"
			>
				<QueryJetpackModules siteId={ siteId } />

				<SettingsSectionHeader
					disabled={ isRequestingSettings || isSavingSettings || disableProtect }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Prevent brute force login attacks' ) }
				/>
				<Protect
					fields={ fields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
				/>

				<QueryJetpackSettings siteId={ siteId } />

				{ ! isAtomic && (
					<Panel header={ translate( 'Jetpack Anti-spam' ) }>
						{ ! inTransition && ! hasAkismetFeature && ! isValidKey ? (
							<PanelBody>
								<Banner
									description={ translate(
										'Automatically remove spam from comments and contact forms.'
									) }
									event={ 'calypso_akismet_settings_upgrade_nudge' }
									feature={ FEATURE_SPAM_AKISMET_PLUS }
									plan={ PLAN_JETPACK_PERSONAL }
									title={ translate(
										'Defend your site against spam! Upgrade to Jetpack Personal.'
									) }
								/>
							</PanelBody>
						) : (
							<PanelBody
								title={ translate( 'Your site is protected from spam' ) }
								icon="yes"
								initialOpen={ true }
							>
								<PanelRow className="form-security__text-field-panel-row">
									<div style={ { display: 'flex', flexDirection: 'column' } }>
										<TextControl
											className={ fieldStyle }
											disabled={ inTransition || ! fields.akismet }
											label={ translate( 'Your API Key' ) }
											onChange={ apiKey => {
												const onChangeApiKey = onChangeField( 'wordpress_api_key' );
												onChangeApiKey( { target: { value: apiKey } } );
											} }
											value={ fields.wordpress_api_key }
										/>
										{ ! inTransition && isValidKey && (
											<FormInputValidation
												isError={ isInvalidKey }
												text={ translate( 'Your Antispam key is valid.' ) }
											/>
										) }
										{ ! inTransition && isInvalidKey && (
											<FormInputValidation
												isError={ isInvalidKey }
												text={ translate( 'Please enter a valid Antispam API key.' ) }
											/>
										) }
									</div>
									<Button
										isPrimary
										disabled={ isRequestingSettings || isSavingSettings || disableSpamFiltering }
										onClick={ handleSubmitForm }
									>
										{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
									</Button>
								</PanelRow>
							</PanelBody>
						) }
					</Panel>
				) }

				<SettingsSectionHeader title={ translate( 'WordPress.com log in' ) } />
				<Sso
					handleAutosavingToggle={ handleAutosavingToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			</form>
		);
	}
}

const connectComponent = connect( ( state, ownProps ) => {
	const { fields, dirtyFields } = ownProps;
	const siteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );
	const protectModuleActive = !! isJetpackModuleActive( state, siteId, 'protect' );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
	const protectIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		siteId,
		'protect'
	);
	const akismetIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		siteId,
		'akismet'
	);
	const hasAkismetFeature = hasFeature( state, siteId, FEATURE_SPAM_AKISMET_PLUS );
	const hasAkismetKeyError =
		isJetpackSettingsSaveFailure( state, siteId, fields ) &&
		includes( dirtyFields, 'wordpress_api_key' );

	return {
		hasAkismetFeature,
		hasAkismetKeyError,
		isAtomic: isATEnabled( selectedSite ),
		protectModuleActive,
		protectModuleUnavailable: siteInDevMode && protectIsUnavailableInDevMode,
		akismetUnavailable: siteInDevMode && akismetIsUnavailableInDevMode,
	};
} );

const getFormSettings = partialRight( pick, [
	'akismet',
	'protect',
	'jetpack_protect_global_whitelist',
	'sso',
	'jetpack_sso_match_by_email',
	'jetpack_sso_require_two_step',
	'wordpress_api_key',
] );

export default flow(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormSecurity );
