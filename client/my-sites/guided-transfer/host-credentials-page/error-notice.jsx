/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import supportUrl from 'lib/url/support';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getGuidedTransferError } from 'state/sites/guided-transfer/selectors';

const ErrorNotice = localize( ( { translate, errorCode } ) => {
	if ( ! errorCode ) {
		return null;
	}

	const errorList = {
		'exceeded-max-validation-attempts':
			translate( "You've entered invalid details one too many times. Please contact support." ),
		'verify-details-failed':
			translate( 'Those hosting details are incorrect. Please try again or contact support.' ),
		'details-already-validated':
			translate( "We've already confirmed your details. Please contact support if you need to change them." ),
	};

	const errorText = get(
		errorList,
		errorCode,
		translate( 'We had trouble saving your details. Please try again or contact support.' )
	);

	return <Notice showDismiss={ false } status="is-error" text={ errorText }>
		<NoticeAction href={ supportUrl.CALYPSO_CONTACT }>{ translate( 'Get Help' ) }</NoticeAction>
	</Notice>;
} );

export default connect( state => ( {
	errorCode: getGuidedTransferError( state, getSelectedSiteId( state ) ),
} ) )( ErrorNotice );
