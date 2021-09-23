import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import React from 'react';
import ConnectDomainStepWrapper from 'calypso/components/domains/connect-domain-step/connect-domain-step-wrapper';

const TransferDomainStepUnlock = ( { className, onNextStep, ...props } ) => {
	const { __ } = useI18n();

	const stepContent = (
		<div className={ className + '__domain-unlock' }>
			<div className={ className + '__actions' }>
				<Button primary onClick={ onNextStep }>
					{ __( "I've unlocked my domain" ) }
				</Button>
			</div>
		</div>
	);

	return (
		<ConnectDomainStepWrapper className={ className } stepContent={ stepContent } { ...props } />
	);
};

TransferDomainStepUnlock.propTypes = {
	className: PropTypes.string.isRequired,
	onNextStep: PropTypes.func.isRequired,
};

export default TransferDomainStepUnlock;
