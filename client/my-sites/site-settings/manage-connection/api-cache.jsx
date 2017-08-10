/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { flowRight, pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import config from 'config';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';

const ApiCache = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	supportsApiCacheCheckbox,
	translate,
} ) => {
	if ( ! config.isEnabled( 'jetpack/api-cache' ) || ! supportsApiCacheCheckbox ) {
		return null;
	}

	return (
		<CompactCard>
			<CompactFormToggle
				checked={ !! fields.api_cache }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'api_cache' ) }
			>
				{ translate( 'Use synchronized data to boost performance' ) } (a8c-only experimental
				feature)
			</CompactFormToggle>
		</CompactCard>
	);
};

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );

	return {
		supportsApiCacheCheckbox: siteIsJetpack && isJetpackMinimumVersion( state, siteId, '4.4.1' ),
	};
} );

const getFormSettings = settings => {
	return pick( settings, [ 'api_cache' ] );
};

export default flowRight( connectComponent, localize, wrapSettingsForm( getFormSettings ) )(
	ApiCache
);
