import {
	WPCOM_FEATURES_AKISMET,
	WPCOM_FEATURES_ANTISPAM,
	isJetpackAntiSpam,
} from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { pick } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryJetpackSettings from 'calypso/components/data/query-jetpack-settings';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteProducts, isSimpleSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import FirewallSettings from '../scan/firewall/firewall';
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
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			settings,
			siteId,
			translate,
		} = this.props;
		const disableSpamFiltering = ! fields.akismet || akismetUnavailable;

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__security-settings"
			>
				<QueryJetpackModules siteId={ siteId } />
				<QueryJetpackSettings siteId={ siteId } />

				<FirewallSettings />

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
	const isSimple = isSimpleSite( state, siteId );
	const isVip = isVipSite( state, siteId );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
	const akismetIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		siteId,
		'akismet'
	);

	const hasAkismetFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_AKISMET );
	const hasAntiSpamFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_ANTISPAM );
	const hasJetpackAntiSpamProduct = getSiteProducts( state, siteId )?.some( isJetpackAntiSpam );

	// This is the same condition as the one in SpamFilteringSettings that's used to determine whether to show the Akismet key field.
	const includeAkismetKeyField =
		! isAtomic && ( hasAkismetFeature || hasAntiSpamFeature || hasJetpackAntiSpamProduct );

	return {
		siteId,
		isAtomic,
		isSimple,
		isVip,
		akismetUnavailable: siteInDevMode && akismetIsUnavailableInDevMode,
		includeAkismetKeyField,
	};
} );

const getFormSettings = ( settings, props ) => {
	const settingsToPick = [
		'akismet',
		'sso',
		'jetpack_sso_match_by_email',
		'jetpack_sso_require_two_step',
	];

	if ( props.includeAkismetKeyField || settings.akismet ) {
		settingsToPick.push( 'wordpress_api_key' );
	}

	return pick( settings, settingsToPick );
};

export default connectComponent(
	localize( wrapSettingsForm( getFormSettings )( SiteSettingsFormSecurity ) )
);
