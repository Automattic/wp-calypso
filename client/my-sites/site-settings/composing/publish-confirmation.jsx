/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import QueryPreferences from 'components/data/query-preferences';
import { isFetchingPreferences } from 'state/preferences/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { saveConfirmationSidebarPreference } from 'state/ui/editor/actions';
import analytics from 'lib/analytics';

const PublishConfirmation = ( {
	siteId,
	fetchingPreferences,
	publishConfirmationEnabled,
	savePublishConfirmationPreference,
	translate,
} ) => {
	const handleToggle = () => {
		savePublishConfirmationPreference( siteId, ! publishConfirmationEnabled );

		analytics.mc.bumpStat( 'calypso_publish_confirmation', publishConfirmationEnabled ? 'enabled' : 'disabled' );

		analytics.tracks.recordEvent( publishConfirmationEnabled
			? 'calypso_publish_confirmation_preference_enable'
			: 'calypso_publish_confirmation_preference_disable' );
	};

	const fieldLabel = translate( 'Show publish confirmation' );
	const fieldDescription = translate(
		'This adds a confirmation step with helpful settings and tips for double checking your content before publishing.'
	);

	return (
		<div>
			<QueryPreferences />
			<CompactFormToggle
				checked={ !! publishConfirmationEnabled }
				disabled={ fetchingPreferences }
				onChange={ handleToggle }
			>
				{ fieldLabel }
			</CompactFormToggle>

			<FormSettingExplanation isIndented>
				{ fieldDescription }
			</FormSettingExplanation>
		</div>
	);
};

PublishConfirmation.defaultProps = {
	isConfirmationSidebarEnabled: true,
};

PublishConfirmation.propTypes = {
	siteId: React.PropTypes.number,
	fetchingPreferences: React.PropTypes.bool,
	publishConfirmationEnabled: React.PropTypes.bool,
	savePublishConfirmationPreference: React.PropTypes.func,
	translate: React.PropTypes.func,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			fetchingPreferences: isFetchingPreferences( state ),
			publishConfirmationEnabled: isConfirmationSidebarEnabled( state, siteId ),
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			savePublishConfirmationPreference: saveConfirmationSidebarPreference,
		}, dispatch );
	},
)( localize( PublishConfirmation ) );
