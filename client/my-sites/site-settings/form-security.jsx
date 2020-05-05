/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import Protect from './protect';
import Sso from './sso';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import SpamFilteringSettings from './spam-filtering-settings';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import { isATEnabled } from 'lib/automated-transfer';

class SiteSettingsFormSecurity extends Component {
	render() {
		const {
			akismetUnavailable,
			dirtyFields,
			fields,
			handleAutosavingToggle,
			handleSubmitForm,
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
					<div>
						<SettingsSectionHeader
							disabled={ isRequestingSettings || isSavingSettings || disableSpamFiltering }
							isSaving={ isSavingSettings }
							onButtonClick={ handleSubmitForm }
							showButton
							title={ translate( 'Anti-spam' ) }
						/>
						<SpamFilteringSettings
							dirtyFields={ dirtyFields }
							fields={ fields }
							currentAkismetKey={ settings.wordpress_api_key }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							onChangeField={ onChangeField }
						/>
					</div>
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

const connectComponent = connect( ( state ) => {
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

	return {
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

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormSecurity );
