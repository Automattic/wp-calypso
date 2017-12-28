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
import CompactCard from 'client/components/card/compact';
import CompactFormToggle from 'client/components/forms/form-toggle/compact';
import config from 'config';
import FormSettingExplanation from 'client/components/forms/form-setting-explanation';
import wrapSettingsForm from 'client/my-sites/site-settings/wrap-settings-form';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { isJetpackMinimumVersion, isJetpackSite } from 'client/state/sites/selectors';

const PublicPostTypes = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	supportsPublicPostTypesCheckbox,
	translate,
} ) => {
	if (
		! config.isEnabled( 'manage/option_sync_non_public_post_stati' ) ||
		! supportsPublicPostTypesCheckbox
	) {
		return null;
	}

	return (
		<CompactCard>
			<CompactFormToggle
				checked={ !! fields.jetpack_sync_non_public_post_stati }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'jetpack_sync_non_public_post_stati' ) }
			>
				{ translate( 'Allow synchronization of Posts and Pages with non-public post statuses' ) }
			</CompactFormToggle>
			<FormSettingExplanation isIndented>
				{ translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }
			</FormSettingExplanation>
		</CompactCard>
	);
};

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );

	return {
		supportsPublicPostTypesCheckbox:
			siteIsJetpack && ! isJetpackMinimumVersion( state, siteId, '4.2' ),
	};
} );

const getFormSettings = settings => {
	return pick( settings, [ 'jetpack_sync_non_public_post_stati' ] );
};

export default flowRight( connectComponent, localize, wrapSettingsForm( getFormSettings ) )(
	PublicPostTypes
);
