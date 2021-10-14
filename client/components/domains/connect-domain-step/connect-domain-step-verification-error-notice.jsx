import PropTypes from 'prop-types';
import { modeType } from 'calypso/components/domains/connect-domain-step/constants';
import Notice from 'calypso/components/notice';
import { getMappingVerificationErrorMessage } from './connect-domain-step-verification-status-parsing.js';

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
