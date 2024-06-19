import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryJetpackSettings from 'calypso/components/data/query-jetpack-settings';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Firewall from './firewall';
import SpamFilteringSettings from './spam-filtering-settings';
import Sso from './sso';
import wrapSettingsForm from './wrap-settings-form';

class SiteSettingsFormSecurity extends Component {
	render() {
		const {
			akismetUnavailable,
			dirtyFields,
			fields,
			handleAutosavingToggle,
			handleSubmitForm,
			isAtomic,
			isVip,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			protectModuleActive,
			protectModuleUnavailable,
			setFieldValue,
			settings,
			siteId,
			translate,
			activateModule,
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
				<QueryJetpackSettings siteId={ siteId } />

				<Firewall
					settings={ settings }
					fields={ fields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
					handleAutosavingToggle={ handleAutosavingToggle }
					handleSubmitForm={ handleSubmitForm }
					dirtyFields={ dirtyFields }
					disableProtect={ disableProtect }
					activateModule={ activateModule }
					isAtomic={ isAtomic }
					isVip={ isVip }
				/>

				{ ! isAtomic && (
					<div>
						<SettingsSectionHeader
							disabled={ isRequestingSettings || isSavingSettings || disableSpamFiltering }
							isSaving={ isSavingSettings }
							onButtonClick={ handleSubmitForm }
							showButton
							title={ translate( 'Akismet Anti-spam' ) }
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
					isAtomic={ isAtomic }
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
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isVip = isVipSite( state, siteId );
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
		siteId,
		isAtomic,
		isVip,
		protectModuleActive,
		protectModuleUnavailable: siteInDevMode && protectIsUnavailableInDevMode,
		akismetUnavailable: siteInDevMode && akismetIsUnavailableInDevMode,
	};
} );

const getFormSettings = ( settings ) =>
	pick( settings, [
		'akismet',
		'protect',
		'jetpack_protect_global_whitelist',
		'jetpack_waf_automatic_rules',
		'jetpack_waf_ip_block_list',
		'jetpack_waf_ip_block_list_enabled',
		'jetpack_waf_automatic_rules_last_updated_timestamp',
		'sso',
		'jetpack_sso_match_by_email',
		'jetpack_sso_require_two_step',
		'wordpress_api_key',
	] );

export default connectComponent(
	localize( wrapSettingsForm( getFormSettings )( SiteSettingsFormSecurity ) )
);
