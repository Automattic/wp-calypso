/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Protect from './protect';
import SpamFilteringSettings from './spam-filtering-settings';
import Sso from './sso';
import wrapSettingsForm from './wrap-settings-form';
import Button from 'components/button';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import SectionHeader from 'components/section-header';
import { isATEnabled } from 'lib/automated-transfer';
import { isJetpackModuleActive, isJetpackModuleUnavailableInDevelopmentMode, isJetpackSiteInDevelopmentMode } from 'state/selectors';
import { siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

class SiteSettingsFormSecurity extends Component {
	renderSectionHeader( title, showButton = true, disableButton = false ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton &&
					<Button
						compact
						primary
						onClick={ this.props.handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings || disableButton }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				}
			</SectionHeader>
		);
	}

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
			jetpackSettingsUiSupported,
			onChangeField,
			protectModuleActive,
			protectModuleUnavailable,
			setFieldValue,
			settings,
			siteId,
			translate,
		} = this.props;

		if ( ! jetpackSettingsUiSupported ) {
			return null;
		}

		const disableProtect = ! protectModuleActive || protectModuleUnavailable;
		const disableSpamFiltering = ! fields.akismet || akismetUnavailable;

		return (
			<form
				id="site-settings"
				onSubmit={ handleSubmitForm }
				className="site-settings__security-settings"
			>
				<QueryJetpackModules siteId={ siteId } />

				{ this.renderSectionHeader( translate( 'Prevent brute force login attacks' ), true, disableProtect ) }
				<Protect
					fields={ fields }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
				/>

				<QueryJetpackSettings siteId={ siteId } />

				{ ! isAtomic &&
					<div>
						{ this.renderSectionHeader( translate( 'Spam filtering' ), true, disableSpamFiltering ) }
						<SpamFilteringSettings
							dirtyFields={ dirtyFields }
							fields={ fields }
							currentAkismetKey={ settings.wordpress_api_key }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							onChangeField={ onChangeField }
						/>
					</div>
				}

				{ this.renderSectionHeader( translate( 'WordPress.com sign in' ), false ) }
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

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const selectedSite = getSelectedSite( state );
		const protectModuleActive = !! isJetpackModuleActive( state, siteId, 'protect' );
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, siteId );
		const protectIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, siteId, 'protect' );
		const akismetIsUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode( state, siteId, 'akismet' );
		const jetpackSettingsUiSupported = siteSupportsJetpackSettingsUi( state, siteId );

		return {
			isAtomic: isATEnabled( selectedSite ),
			jetpackSettingsUiSupported,
			protectModuleActive,
			protectModuleUnavailable: siteInDevMode && protectIsUnavailableInDevMode,
			akismetUnavailable: siteInDevMode && akismetIsUnavailableInDevMode,
		};
	}
);

const getFormSettings = partialRight( pick, [
	'akismet',
	'protect',
	'jetpack_protect_global_whitelist',
	'sso',
	'jetpack_sso_match_by_email',
	'jetpack_sso_require_two_step',
	'wordpress_api_key'
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsFormSecurity );
