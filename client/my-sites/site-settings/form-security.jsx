/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wrapSettingsForm from './wrap-settings-form';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
import Protect from './protect';
import Sso from './sso';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import SpamFilteringSettings from './spam-filtering-settings';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import { isATEnabled } from 'lib/automated-transfer';

class SiteSettingsFormSecurity extends Component {
	renderSectionHeader( title, showButton = true, disableButton = false ) {
		const { isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton && (
					<Button
						compact
						primary
						onClick={ this.props.handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings || disableButton }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				) }
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
			inactive,
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

		const className = classNames( 'site-settings__security-settings', {
			'site-settings__inactive-setting': inactive,
		} );

		return (
			<form id="site-settings" onSubmit={ handleSubmitForm } className={ className }>
				<QueryJetpackModules siteId={ siteId } />

				{ this.renderSectionHeader(
					translate( 'Prevent brute force login attacks' ),
					true,
					disableProtect
				) }
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
						{ this.renderSectionHeader(
							translate( 'Spam filtering' ),
							true,
							disableSpamFiltering
						) }
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

const connectComponent = connect( state => {
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
	const jetpackSettingsUiSupported = siteSupportsJetpackSettingsUi( state, siteId );

	return {
		isAtomic: isATEnabled( selectedSite ),
		jetpackSettingsUiSupported,
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

export default flowRight( connectComponent, localize, wrapSettingsForm( getFormSettings ) )(
	SiteSettingsFormSecurity
);
