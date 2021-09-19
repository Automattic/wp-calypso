import React from 'react';
import ConnectDomainStepOwnershipAuthCode from 'calypso/components/domains/connect-domain-step/connect-domain-step-ownership-auth-code';

const TransferDomainStepAuthCode = ( props ) => {
	return (
		<ConnectDomainStepOwnershipAuthCode buttonMessage="Check readiness for transfer" { ...props } />
	);
};

export default TransferDomainStepAuthCode;
