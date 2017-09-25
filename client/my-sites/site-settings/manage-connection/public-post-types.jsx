/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight, pick } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import config from 'config';
import wrapSettingsForm from 'my-sites/site-settings/wrap-settings-form';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const PublicPostTypes = ( {
	fields,
	handleAutosavingToggle,
	isRequestingSettings,
	isSavingSettings,
	supportsPublicPostTypesCheckbox,
	translate
} ) => {
	if ( ! config.isEnabled( 'manage/option_sync_non_public_post_stati' ) || ! supportsPublicPostTypesCheckbox ) {
		return null;
	}

	return (
		<CompactCard>
			<CompactFormToggle
				checked={ !! fields.jetpack_sync_non_public_post_stati }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleAutosavingToggle( 'jetpack_sync_non_public_post_stati' ) }
			>
				{ translate(
					'Allow synchronization of Posts and Pages with non-public post statuses'
				) }
			</CompactFormToggle>
			<FormSettingExplanation isIndented>
				{ translate( '(e.g. drafts, scheduled, private, etc\u2026)' ) }
			</FormSettingExplanation>
		</CompactCard>
	);
};

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );

		return {
			supportsPublicPostTypesCheckbox: siteIsJetpack && ! isJetpackMinimumVersion( state, siteId, '4.2' ),
		};
	}
);

const getFormSettings = ( settings ) => {
	return pick( settings, [
		'jetpack_sync_non_public_post_stati',
	] );
};

export default flowRight(
	connectComponent,
	localize,
	wrapSettingsForm( getFormSettings )
)( PublicPostTypes );
