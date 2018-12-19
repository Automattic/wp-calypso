/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSettingsNavigation from 'my-sites/site-settings/navigation';
import FormPerformance from 'my-sites/site-settings/form-performance';
import JetpackDevModeNotice from 'my-sites/site-settings/jetpack-dev-mode-notice';
import AmpJetpack from 'my-sites/site-settings/amp/jetpack';
import AmpWpcom from 'my-sites/site-settings/amp/wpcom';
import Search from 'my-sites/site-settings/search';
import Placeholder from 'my-sites/site-settings/placeholder';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const SiteSettingsPerformance = ( {
	fields,
	handleAutosavingToggle,
	isJetpack,
	isRequestingSettings,
	isSavingSettings,
	site,
	submitForm,
	trackEvent,
	translate,
	updateFields,
} ) => {
	if ( ! site ) {
		return <Placeholder />;
	}

	return (
		<Main className="settings-performance site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<JetpackDevModeNotice />
			<SidebarNavigation />
			<SiteSettingsNavigation site={ site } section="performance" />
			<FormPerformance />
			<Search
				handleAutosavingToggle={ handleAutosavingToggle }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>

			{ isJetpack ? (
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
};

const connectComponent = connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );

	return {
		site,
		isJetpack,
	};
} );

const getFormSettings = partialRight( pick, [
	'jetpack_search_enabled',
	'jetpack_search_supported',
	'amp_is_supported',
	'amp_is_enabled',
] );

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( SiteSettingsPerformance );
