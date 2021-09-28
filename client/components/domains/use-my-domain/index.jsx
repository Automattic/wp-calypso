import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import ConnectDomainSteps from 'calypso/components/domains/connect-domain-step/connect-domain-steps';
import {
	stepSlug,
	domainLockStatusType,
} from 'calypso/components/domains/connect-domain-step/constants';
import {
	connectADomainOwnershipVerificationStepsDefinition,
	transferLockedDomainStepsDefinition,
	transferUnlockedDomainStepsDefinition,
} from 'calypso/components/domains/connect-domain-step/page-definitions';
import {
	getAvailabilityErrorMessage,
	getDomainNameValidationErrorMessage,
} from 'calypso/components/domains/use-my-domain/utilities';
import FormattedHeader from 'calypso/components/formatted-header';
import wpcom from 'calypso/lib/wp';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import UseMyDomainInput from './domain-input';
import DomainTransferOrConnect from './transfer-or-connect';

import './style.scss';

function UseMyDomain( {
	goBack,
	initialQuery,
	isSignupStep,
	onConnect,
	onTransfer,
	selectedSite,
	transferDomainUrl,
} ) {
	const inputMode = useMemo(
		() => ( {
			domainInput: 'domain-input',
			transferOrConnect: 'transfer-or-connect',
			ownershipVerification: 'ownership-verification',
			transferDomain: 'transfer-domain',
		} ),
		[]
	);

	const [ domainAvailabilityData, setDomainAvailabilityData ] = useState( {} );
	const [ domainName, setDomainName ] = useState( initialQuery ?? '' );
	const [ domainNameValidationError, setDomainNameValidationError ] = useState();
	const [ domainLockStatus, setDomainLockStatus ] = useState( domainLockStatusType.LOCKED );
	const [ isDomainTransferrable, setIsDomainTransferrable ] = useState( false );
	const [ isFetchingDomainLockStatus, setIsFetchingDomainLockStatus ] = useState( false );
	const [ transferDomainStepsDefinition, setTransferDomainStepsDefinition ] = useState(
		transferLockedDomainStepsDefinition
	);
	const [ isFetchingAvailability, setIsFetchingAvailability ] = useState( false );
	const [ mode, setMode ] = useState( inputMode.domainInput );
	const [ ownershipVerificationFlowPageSlug, setOwnershipVerificationFlowPageSlug ] = useState(
		stepSlug.OWNERSHIP_VERIFICATION_LOGIN
	);
	const [ transferDomainFlowPageSlug, setTransferDomainFlowPageSlug ] = useState(
		stepSlug.TRANSFER_START
	);
	const initialValidation = useRef( null );

	const baseClassName = 'use-my-domain';

	const onGoBack = () => {
		const prevOwnershipVerificationFlowPageSlug =
			connectADomainOwnershipVerificationStepsDefinition[ ownershipVerificationFlowPageSlug ]?.prev;
		const prevTransferDomainStepsDefinition =
			transferDomainStepsDefinition[ transferDomainFlowPageSlug ]?.prev;

		switch ( mode ) {
			case inputMode.ownershipVerification:
				if ( prevOwnershipVerificationFlowPageSlug ) {
					setOwnershipVerificationFlowPageSlug( prevOwnershipVerificationFlowPageSlug );
				} else {
					setMode( inputMode.transferOrConnect );
				}
				return;
			case inputMode.transferDomain:
				if ( prevTransferDomainStepsDefinition ) {
					setTransferDomainFlowPageSlug( prevTransferDomainStepsDefinition );
				} else {
					setMode( inputMode.transferOrConnect );
				}
				return;
			case inputMode.transferOrConnect:
				setMode( inputMode.domainInput );
				return;
			default:
				goBack();
		}
	};

	const validateDomainName = useCallback( () => {
		const errorMessage = getDomainNameValidationErrorMessage( domainName );
		setDomainNameValidationError( errorMessage );
		return ! errorMessage;
	}, [ domainName ] );

	const setDomainTransferData = useCallback(
		( isDomainUnlocked, transferEligibleDate ) => {
			const { LOCKED, UNLOCKED, UNKNOWN } = domainLockStatusType;
			let lockStatus = UNKNOWN;

			const isTransferrable = null === transferEligibleDate;

			setIsDomainTransferrable( isTransferrable );

			setTransferDomainStepsDefinition(
				isDomainUnlocked
					? transferUnlockedDomainStepsDefinition
					: transferLockedDomainStepsDefinition
			);

			if ( isDomainUnlocked === null ) {
				lockStatus = UNKNOWN;
			} else {
				lockStatus = isDomainUnlocked ? UNLOCKED : LOCKED;
			}

			setDomainLockStatus( lockStatus );
		},
		[ setIsDomainTransferrable, setTransferDomainStepsDefinition, setDomainLockStatus ]
	);

	const onNext = useCallback( async () => {
		if ( ! validateDomainName() ) {
			return;
		}

		setIsFetchingAvailability( true );
		setDomainAvailabilityData( {} );

		try {
			const availabilityData = await wpcom
				.domain( domainName )
				.isAvailable( { apiVersion: '1.3', blog_id: selectedSite.ID, is_cart_pre_check: false } );

			const {
				unlocked: isDomainUnlocked,
				transfer_eligible_date: transferEligibleDate,
			} = await wpcom.undocumented().getInboundTransferStatus( domainName );

			const availabilityErrorMessage = getAvailabilityErrorMessage( {
				availabilityData,
				domainName,
				selectedSite,
			} );

			if ( availabilityErrorMessage ) {
				setDomainNameValidationError( availabilityErrorMessage );
			} else {
				setMode( inputMode.transferOrConnect );
				setDomainAvailabilityData( availabilityData );
				setDomainTransferData( isDomainUnlocked, transferEligibleDate );
			}
		} catch ( error ) {
			setDomainNameValidationError( error );
		} finally {
			setIsFetchingAvailability( false );
		}
	}, [
		domainName,
		inputMode.transferOrConnect,
		selectedSite,
		validateDomainName,
		setDomainTransferData,
	] );

	const onDomainNameChange = ( event ) => {
		setDomainName( event.target.value );
		domainNameValidationError && setDomainNameValidationError();
	};

	const onClearInput = () => {
		setDomainName( '' );
		setDomainNameValidationError();
	};

	useEffect( () => {
		if ( ! initialQuery || initialValidation.current ) {
			return;
		}

		initialValidation.current = true;
		initialQuery && ! getDomainNameValidationErrorMessage( initialQuery ) && onNext();
	}, [ initialQuery, onNext ] );

	const showOwnershipVerificationFlow = () => {
		setMode( inputMode.ownershipVerification );
	};

	const showTransferDomainFlow = () => {
		setMode( inputMode.transferDomain );
	};

	const renderDomainInput = () => {
		return (
			<UseMyDomainInput
				baseClassName={ baseClassName }
				domainName={ domainName }
				isBusy={ isFetchingAvailability }
				onChange={ onDomainNameChange }
				onClear={ onClearInput }
				onNext={ onNext }
				shouldSetFocus={ ! initialQuery }
				validationError={ domainNameValidationError }
			/>
		);
	};

	const renderTransferOrConnect = () => {
		return (
			<DomainTransferOrConnect
				availability={ domainAvailabilityData }
				isDomainTransferrable={ isDomainTransferrable }
				domain={ domainName }
				isSignupStep={ isSignupStep }
				onConnect={
					'auth_code' === domainAvailabilityData.ownership_verification_type
						? showOwnershipVerificationFlow
						: onConnect
				}
				onTransfer={
					config.isEnabled( 'domains/new-transfer-flow' ) ? showTransferDomainFlow : onTransfer
				}
				transferDomainUrl={ transferDomainUrl }
			/>
		);
	};

	const renderOwnershipVerificationFlow = () => {
		return (
			<ConnectDomainSteps
				baseClassName={ 'connect-domain-step' }
				domain={ domainName }
				initialPageSlug={ ownershipVerificationFlowPageSlug }
				isOwnershipVerificationFlow={ true }
				onConnect={ onConnect }
				onSetPage={ setOwnershipVerificationFlowPageSlug }
				stepsDefinition={ connectADomainOwnershipVerificationStepsDefinition }
			/>
		);
	};

	const renderTransferDomainFlow = () => {
		return (
			<ConnectDomainSteps
				baseClassName={ 'connect-domain-step' }
				domain={ domainName }
				initialPageSlug={ transferDomainFlowPageSlug }
				onTransfer={ onTransfer }
				onSetPage={ setTransferDomainFlowPageSlug }
				stepsDefinition={ transferDomainStepsDefinition }
				isFetchingDomainLockStatus={ isFetchingDomainLockStatus }
				domainLockStatus={ domainLockStatus }
			/>
		);
	};

	const renderContent = () => {
		switch ( mode ) {
			case inputMode.domainInput:
				return renderDomainInput();
			case inputMode.transferOrConnect:
				return renderTransferOrConnect();
			case inputMode.ownershipVerification:
				return renderOwnershipVerificationFlow();
			case inputMode.transferDomain:
				return renderTransferDomainFlow();
		}
	};

	const headerText =
		mode === inputMode.domainInput
			? __( 'Use a domain I own' )
			: /* translators: %s - the name of the domain the user will add to their site */
			  sprintf( __( 'Use a domain I own: %s' ), domainName );

	return (
		<>
			<BackButton className={ baseClassName + '__go-back' } onClick={ onGoBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ __( 'Back' ) }
			</BackButton>
			<FormattedHeader
				brandFont
				className={ baseClassName + '__page-heading' }
				headerText={ headerText }
				align="left"
			/>
			{ renderContent() }
		</>
	);
}

UseMyDomain.propTypes = {
	goBack: PropTypes.func.isRequired,
	initialQuery: PropTypes.string,
	isSignupStep: PropTypes.bool,
	onConnect: PropTypes.func,
	onTransfer: PropTypes.func,
	selectedSite: PropTypes.object,
	transferDomainUrl: PropTypes.string,
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	UseMyDomain
);
