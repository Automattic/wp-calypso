import { Button, MaterialIcon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import ConnectDomainStepWrapper from 'calypso/components/domains/connect-domain-step/connect-domain-step-wrapper';
import {
	stepsHeading,
	domainLockStatusType,
} from 'calypso/components/domains/connect-domain-step/constants';
import Notice from 'calypso/components/notice';
import wpcom from 'calypso/lib/wp';

const TransferDomainStepUnlock = ( {
	className,
	onNextStep,
	domain,
	domainLockStatus: initialDomainLockStatus,
	...props
} ) => {
	const { __ } = useI18n();

	const [ checkInProgress, setCheckInProgress ] = useState( false );
	const [ domainStatusError, setDomainStatusError ] = useState( null );
	const [ lockStatusUnknown, setLockStatusUnknown ] = useState( false );

	const getDomainLockStatus = useCallback( async () => {
		setCheckInProgress( true );
		const { unlocked } = await wpcom.req.get(
			`/domains/${ encodeURIComponent( domain ) }/inbound-transfer-status`
		);
		setCheckInProgress( false );
		return unlocked;
	}, [ domain, setCheckInProgress ] );

	const checkDomainLockStatus = async () => {
		try {
			const isDomainUnlocked = await getDomainLockStatus();
			if (
				isDomainUnlocked ||
				lockStatusUnknown ||
				( domainLockStatusType.UNKNOWN === initialDomainLockStatus && null === isDomainUnlocked )
			) {
				onNextStep();
			} else if ( isDomainUnlocked === null ) {
				setDomainStatusError( 'Can’t get the domain’s lock status' );
				setLockStatusUnknown( true );
			} else {
				setDomainStatusError( 'Your domain is locked' );
			}
		} catch {
			setDomainStatusError( 'Can’t get the domain’s lock status' );
			setLockStatusUnknown( true );
		}
	};

	const lockedDomainContent =
		initialDomainLockStatus === domainLockStatusType.UNLOCKED ? null : (
			<CardHeading tagName="h2" className={ className + '__sub-heading' }>
				<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="lock" />
				{ initialDomainLockStatus === domainLockStatusType.LOCKED && ! lockStatusUnknown
					? __( 'Your domain is locked' )
					: __( "Can't get the domain's lock status" ) }
			</CardHeading>
		);

	const lockedDomainDescription = __(
		'Domain providers lock domains to prevent unauthorized transfers. You’ll need to unlock it on your domain provider’s settings page. Some domain providers require you to contact them via their customer support to unlock it.'
	);

	const unkownLockStatusAdditionalDescription = (
		<>{ __( 'Please check that your domain is unlocked.' ) + ' ' }</>
	);

	const getErrorMessage = () => {
		return lockStatusUnknown
			? __(
					'Can’t get the domain’s lock status. If you’ve already unlocked it, wait a few minutes and try again.'
			  )
			: __(
					'Your domain is still locked. If you’ve already unlocked it, wait a few minutes and try again.'
			  );
	};

	const stepContent = (
		<div className={ className + '__domain-unlock' }>
			{ domainStatusError && ! checkInProgress && (
				<Notice status="is-error" showDismiss={ false } text={ getErrorMessage() }></Notice>
			) }
			{ lockedDomainContent }
			<p className={ className + '__text' }>
				{ ( initialDomainLockStatus === domainLockStatusType.UNKNOWN || lockStatusUnknown ) &&
					unkownLockStatusAdditionalDescription }
				{ lockedDomainDescription }
			</p>
			<p className={ className + '__text' }>
				{ __( 'It might take a few minutes for any changes to take effect.' ) }
				<br />
				{ __( 'Once you have unlocked your domain click on the button below to proceed.' ) }
			</p>
			<div className={ className + '__actions' }>
				<Button primary onClick={ checkDomainLockStatus } busy={ checkInProgress }>
					{ domainLockStatusType.UNKNOWN === initialDomainLockStatus || lockStatusUnknown
						? __( 'Skip domain lock verificaiton' )
						: __( "I've unlocked my domain" ) }
				</Button>
			</div>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			heading={ stepsHeading.TRANSFER }
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
