/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import AmpJetpack from 'my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'my-sites/site-settings/amp/wpcom';
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import Main from 'components/main';
import MediaSettingsPerformance from 'my-sites/site-settings/media-settings-performance';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import Search from 'my-sites/site-settings/search';
import SectionHeader from 'components/section-header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import SpeedUpYourSite from 'my-sites/site-settings/speed-up-site-settings';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import {
	isJetpackSite,
	isJetpackMinimumVersion,
	siteSupportsJetpackSettingsUi,
} from 'state/sites/selectors';

class SiteSettingsPerformance extends Component {
	renderSectionHeader( title, showButton = true ) {
		const { handleSubmitForm, isRequestingSettings, isSavingSettings, translate } = this.props;
		return (
			<SectionHeader label={ title }>
				{ showButton && (
					<Button
						compact
						primary
						onClick={ handleSubmitForm }
						disabled={ isRequestingSettings || isSavingSettings }
					>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				) }
			</SectionHeader>
		);
	}

	render() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			jetpackSettingsUI,
			jetpackVersionSupportsLazyImages,
			onChangeField,
			site,
			siteId,
			siteIsJetpack,
			submitForm,
			translate,
			trackEvent,
			updateFields,
		} = this.props;

		return (
			<Main className="settings-performance site-settings site-settings__performance-settings">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<JetpackDevModeNotice />
				<SidebarNavigation />
				<SiteSettingsNavigation site={ site } section="performance" />

				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				{ jetpackSettingsUI && jetpackVersionSupportsLazyImages && (
					<Fragment>
						{ this.renderSectionHeader( translate( 'Performance & speed' ), false ) }
						<SpeedUpYourSite
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							jetpackVersionSupportsLazyImages={ jetpackVersionSupportsLazyImages }
							submitForm={ submitForm }
							updateFields={ updateFields }
						/>
					</Fragment>
				) }

				{ jetpackSettingsUI && (
					<Fragment>
						{ this.renderSectionHeader( translate( 'Media' ), false ) }
						<MediaSettingsPerformance
							siteId={ siteId }
							handleAutosavingToggle={ handleAutosavingToggle }
							onChangeField={ onChangeField }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							fields={ fields }
							jetpackVersionSupportsLazyImages={ jetpackVersionSupportsLazyImages }
						/>
					</Fragment>
				) }

				<Search
					handleAutosavingToggle={ handleAutosavingToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>

				{ siteIsJetpack ? (
					<AmpJetpack />
				) : (
					<AmpWpcom
						submitForm={ submitForm }
						trackEvent={ trackEvent }
						updateFields={ updateFields }
						isSavingSettings={ isSavingSettings }
						isRequestingSettings={ isRequestingSettings }
						fields={ fields }
					/>
				) }
			</Main>
		);
	}
}

const connectComponent = connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const jetpackSettingsUiSupported = siteSupportsJetpackSettingsUi( state, siteId );
	const jetpackVersionSupportsLazyImages = isJetpackMinimumVersion( state, siteId, '5.8-alpha' );

	return {
		site,
		siteIsJetpack,
		jetpackVersionSupportsLazyImages,
		jetpackSettingsUI: siteIsJetpack && jetpackSettingsUiSupported,
	};
} );

const getFormSettings = partialRight( pick, [
	'amp_is_enabled',
	'amp_is_supported',
	'jetpack_search_enabled',
	'jetpack_search_supported',
	'lazy-images',
	'photon',
	'photon-cdn',
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsPerformance );
