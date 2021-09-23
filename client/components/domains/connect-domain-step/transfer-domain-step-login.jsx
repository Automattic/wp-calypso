import React from 'react';
import ConnectDomainStepLogin from 'calypso/components/domains/connect-domain-step/connect-domain-step-login';
import { stepsHeadingTransfer } from 'calypso/components/domains/connect-domain-step/constants';

const TransferDomainStepLogin = ( props ) => {
	return <ConnectDomainStepLogin { ...props } heading={ stepsHeadingTransfer } />;
};

export default TransferDomainStepLogin;
