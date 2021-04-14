/**
 * External dependencies
 */
import React, { ReactElement, Fragment, useEffect, useState } from 'react';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal component dependencies
 */
import { Card } from '@automattic/components';
import FormToggle from 'calypso/components/forms/form-toggle';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

/**
 * Internal state dependencies
 */
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import hasSearchProductSelector from './hooks/has-search-product';

type PartialSiteSettings = { instant_search_enabled: boolean; jetpack_search_enabled: boolean };

export default function JetpackSearchModuleConfig(): ReactElement {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) as number );
	const siteSettings = useSelector(
		( state ) => getSiteSettings( state, siteId ) as PartialSiteSettings
	);
	const hasSearchProduct = useSelector( hasSearchProductSelector );

	// Server-side config values
	const isSearchActive = useSelector( ( state ) => {
		if ( isJetpackSite( state, siteId ) ) {
			return isJetpackModuleActive( state, siteId, 'search' );
		}

		return siteSettings && siteSettings[ 'jetpack_search_enabled' ];
	} );
	const isInstantSearchActive = siteSettings && siteSettings[ 'instant_search_enabled' ];

	const isRequestingSettings = false;
	const isSavingSettings = false;

	// Local UI state values
	const [ searchEnabled, onChangeSearchEnabled ] = useState( !! isSearchActive );
	const [ instantSearchEnabled, onChangeInstantSearchEnabled ] = useState(
		!! isInstantSearchActive
	);

	// If server side values update, update local UI state values
	useEffect( () => {
		searchEnabled !== isSearchActive && onChangeSearchEnabled( !! isSearchActive );
	}, [ searchEnabled, isSearchActive ] );
	useEffect( () => {
		instantSearchEnabled !== isInstantSearchActive &&
			onChangeSearchEnabled( !! isInstantSearchActive );
	}, [ instantSearchEnabled, isInstantSearchActive ] );

	return (
		<Fragment>
			<QuerySiteSettings siteId={ siteId } />
			<SettingsSectionHeader
				title={ translate( 'General', { context: 'Settings header' } ) }
				id="site-settings__footer-credit-header"
				showButton
			/>
			<Card>
				<FormFieldset className="jetpack-search__module-settings">
					<FormToggle
						checked={ searchEnabled }
						disabled={ isRequestingSettings || isSavingSettings }
						onChange={ onChangeSearchEnabled }
					>
						{ translate( 'Enable Jetpack Search' ) }
					</FormToggle>
					<FormSettingExplanation>
						{ translate( 'Improves built-in WordPress search performance.' ) }
					</FormSettingExplanation>
					<br />

					<FormToggle
						checked={ instantSearchEnabled }
						disabled={ ! hasSearchProduct || isRequestingSettings || isSavingSettings }
						onChange={ onChangeInstantSearchEnabled }
					>
						{ translate( 'Enable instant search experience (recommended)' ) }
					</FormToggle>
					<FormSettingExplanation>
						{ translate(
							'Replaces WordPress search with the new instant search interface by Jetpack Search.'
						) }
						{ /* The following notice is only shown for Business/Pro plan holders. */ }
						{ ! hasSearchProduct &&
							translate( 'Instant search is only available with a Jetpack Search subscription.' ) }
					</FormSettingExplanation>
				</FormFieldset>
			</Card>
		</Fragment>
	);
}
