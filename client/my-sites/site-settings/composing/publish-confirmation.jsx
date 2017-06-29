/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const PublishConfirmation = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	translate,
} ) => {
	const fieldName = 'publish_confirmation';

	if ( ! fields.hasOwnProperty( fieldName ) ) {
		return null;
	}

	const fieldLabel = translate( 'Show publish confirmation' );
	const fieldDescription = translate(
		'This adds a confirmation step with helpful settings and tips for double checking your content before publishing.'
	);

	return (
		<div>
			<CompactFormToggle
				checked={ !! fields[ fieldName ] }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleToggle( fieldName ) }
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
	fields: {},
	isRequestingSettings: true,
	isSavingSettings: false,
};

PublishConfirmation.propTypes = {
	fields: PropTypes.object,
	handleToggle: PropTypes.func.isRequired,
	isRequestingSettings: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
};

export default localize( PublishConfirmation );
