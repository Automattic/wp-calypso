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
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

const PublishConfirmation = ( {
	publishConfirmationPreference,
	savePublishConfirmationPreference,
	translate,
} ) => {
	const handleToggle = () => {
		savePublishConfirmationPreference( ! publishConfirmationPreference );
	};

	const fieldLabel = translate( 'Show publish confirmation' );
	const fieldDescription = translate(
		'This adds a confirmation step with helpful settings and tips for double checking your content before publishing.'
	);

	return (
		<div>
			<QueryPreferences />
			<CompactFormToggle
				checked={ !! publishConfirmationPreference }
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
	publishConfirmationPreference: true,
};

PublishConfirmation.propTypes = {
	publishConfirmationPreference: React.PropTypes.bool,
	savePublishConfirmationPreference: React.PropTypes.func,
};

export default connect(
	( state ) => {
		return {
			publishConfirmationPreference: getPreference( state, 'publishConfirmation' ),
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			savePublishConfirmationPreference: savePreference.bind( null, 'publishConfirmation' ),
		}, dispatch );
	},
)( localize( PublishConfirmation ) );
