/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';
import { modeType } from 'calypso/components/domains/connect-domain-step/constants';
import { getMappingVerificationErrorMessage } from './connect-domain-step-verification-status-parsing.js';

/**
 * Style dependencies
 */
import './style.scss';

export default function ConnectDomainStepVerificationNotice( { mode, verificationStatus } ) {
	const errorMessage = getMappingVerificationErrorMessage( mode, verificationStatus ) || null;

	if ( ! errorMessage ) {
		return null;
	}

	return (
		<Notice status="is-error" showDismiss={ false }>
			{ errorMessage }
		</Notice>
	);
}

ConnectDomainStepVerificationNotice.propTypes = {
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	verificationStatus: PropTypes.object.isRequired,
};
