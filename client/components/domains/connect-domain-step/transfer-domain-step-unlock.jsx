import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import ConnectDomainStepWrapper from 'calypso/components/domains/connect-domain-step/connect-domain-step-wrapper';
import { stepsHeadingTransfer } from 'calypso/components/domains/connect-domain-step/constants';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';

const TransferDomainStepUnlock = ( { className, onNextStep, domain, ...props } ) => {
	const { __ } = useI18n();

	const [ checkInProgress, setCheckInProgress ] = useState( false );
	const [ domainStatusError, setDomainStatusError ] = useState( null );

	const getDomainLockStatus = useCallback( async () => {
		setCheckInProgress( true );
		const { unlocked } = await wpcom.undocumented().getInboundTransferStatus( domain );
		setCheckInProgress( false );
		return unlocked;
	}, [ domain, setCheckInProgress ] );

	const checkDomainLockStatus = async () => {
		try {
			const isDomainUnlocked = await getDomainLockStatus();
			if ( isDomainUnlocked ) onNextStep();
			else {
				setDomainStatusError( 'Your domain is locked' );
			}
		} catch {
			setDomainStatusError( 'Can’t get the domain’s lock status' );
		}
	};

	const stepContent = (
		<div className={ className + '__domain-unlock' }>
			{ domainStatusError && ! checkInProgress && (
				<Notice
					status="is-error"
					showDismiss={ false }
					text="Your domain is still locked. If you’ve already unlocked it, wait a few minutes and try again."
				></Notice>
			) }
			<p className={ className + '__text' }>
				{ __(
					'Domain providers lock domains to prevent unauthorized transfers. You’ll need to unlock it on your domain provider’s settings page. Some domain providers require you to contact them via their customer support to unlock it.'
				) }
				<br />
				<br />
				{ __( 'It might take a few minutes for any changes to take effect.' ) }
				<br />
				{ __( 'Once you have unlocked your domain click on the button below to proceed.' ) }
			</p>
			<div className={ className + '__actions' }>
				<Button primary onClick={ checkDomainLockStatus } busy={ checkInProgress }>
					{ __( "I've unlocked my domain" ) }
				</Button>
			</div>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			heading={ stepsHeadingTransfer }
			className={ className }
			stepContent={ stepContent }
			{ ...props }
		/>
	);
};

TransferDomainStepUnlock.propTypes = {
	className: PropTypes.string.isRequired,
	onNextStep: PropTypes.func.isRequired,
};

export default TransferDomainStepUnlock;
