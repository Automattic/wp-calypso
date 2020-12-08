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
import { CompactCard } from '@automattic/components';
import FormToggle from 'calypso/components/forms/form-toggle';
import config from 'calypso/config';
import wrapSettingsForm from 'calypso/my-sites/site-settings/wrap-settings-form';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';

const ApiCache = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	siteIsJetpack,
	translate,
} ) => {
	if ( ! config.isEnabled( 'jetpack/api-cache' ) || ! siteIsJetpack ) {
		return null;
	}

	return (
		<CompactCard>
			<FormToggle
				checked={ !! fields.api_cache }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'api_cache' ) }
			>
				{ translate( 'Use synchronized data to boost performance' ) } (a8c-only experimental
				feature)
			</FormToggle>
		</CompactCard>
	);
};

const connectComponent = connect( ( state ) => ( {
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
} ) );

const getFormSettings = ( settings ) => {
	return pick( settings, [ 'api_cache' ] );
};

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( ApiCache );
