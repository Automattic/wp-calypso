/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import { EMAIL_WARNING_TYPE_ACTION_REQUIRED } from 'calypso/lib/emails/email-provider-constants';

const getWarningStatus = ( warning ) => {
	return EMAIL_WARNING_TYPE_ACTION_REQUIRED === warning.warning_type ? 'is-info' : 'is-warning';
};

const EmailPlanWarnings = ( { warnings } ) => {
	if ( ! warnings?.[ 0 ] ) {
		return null;
	}

	return warnings.map( ( warning, index ) => (
		<Notice
			status={ getWarningStatus( warning ) }
			text={ warning.message }
			showDismiss={ false }
			className="email-plan-warnings__warning"
			key={ index }
		/>
	) );
};

EmailPlanWarnings.propTypes = {
	warnings: PropTypes.array,
};

export default EmailPlanWarnings;
