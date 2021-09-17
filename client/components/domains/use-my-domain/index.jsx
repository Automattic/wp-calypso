import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import ConnectDomainSteps from 'calypso/components/domains/connect-domain-step/connect-domain-steps';
import {
	stepSlug,
	domainLockStatusType,
	useMyDomainInputMode as inputMode,
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
	showHeader,
	transferDomainUrl,
	initialMode,
} ) {
	const { __ } = useI18n();
	const [ domainAvailabilityData, setDomainAvailabilityData ] = useState( null );
	const [ domainInboundTransferStatusInfo, setDomainInboundTransferStatusInfo ] = useState( null );
	const [ domainName, setDomainName ] = useState( initialQuery ?? '' );
	const [ domainNameValidationError, setDomainNameValidationError ] = useState();
	const [ domainLockStatus, setDomainLockStatus ] = useState( domainLockStatusType.LOCKED );
	const [ transferDomainStepsDefinition, setTransferDomainStepsDefinition ] = useState(
		transferLockedDomainStepsDefinition
	);
	const [ isFetchingAvailability, setIsFetchingAvailability ] = useState( false );
	const wasInitialModeSet = Boolean(
		Object.values( inputMode ).includes( initialMode ) && initialQuery
	);
	const [ mode, setMode ] = useState( wasInitialModeSet ? initialMode : inputMode.domainInput );
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
					if ( wasInitialModeSet ) return goBack();
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

	const setTransferStepsAndLockStatus = useCallback(
		( isDomainUnlocked ) => {
			const { LOCKED, UNLOCKED, UNKNOWN } = domainLockStatusType;
			let lockStatus = UNKNOWN;

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
		[ setTransferDomainStepsDefinition, setDomainLockStatus ]
	);

	const setDomainTransferData = useCallback( async () => {
		// TODO: remove this try-catch when the next statuses get added on the API
		setIsFetchingAvailability( true );
		let inboundTransferStatusResult = {};
		try {
			inboundTransferStatusResult = await wpcom
				.undocumented()
				.getInboundTransferStatus( domainName );
		} catch {}

		const inboundTransferStatusInfo = {
			creationDate: inboundTransferStatusResult.creation_date,
			email: inboundTransferStatusResult.admin_email,
			inRedemption: inboundTransferStatusResult.in_redemption,
			losingRegistrar: inboundTransferStatusResult.registrar,
			losingRegistrarIanaId: inboundTransferStatusResult.registrar_iana_id,
			privacy: inboundTransferStatusResult.privacy,
			termMaximumInYears: inboundTransferStatusResult.term_maximum_in_years,
			transferEligibleDate: inboundTransferStatusResult.transfer_eligible_date,
			transferRestrictionStatus: inboundTransferStatusResult.transfer_restriction_status,
			unlocked: inboundTransferStatusResult.unlocked,
		};

		setDomainInboundTransferStatusInfo( inboundTransferStatusInfo );
		setTransferStepsAndLockStatus( inboundTransferStatusInfo.unlocked );

		setIsFetchingAvailability( false );
	}, [ domainName, setTransferStepsAndLockStatus ] );

	const onNext = useCallback( async () => {
		if ( ! validateDomainName() ) {
			return;
		}

		setIsFetchingAvailability( true );
		setDomainAvailabilityData( null );

		try {
			const availabilityData = await wpcom
				.domain( domainName )
				.isAvailable( { apiVersion: '1.3', blog_id: selectedSite.ID, is_cart_pre_check: false } );

			await setDomainTransferData();

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
			}
		} catch ( error ) {
			setDomainNameValidationError( error.message );
		} finally {
			setIsFetchingAvailability( false );
		}
	}, [ domainName, selectedSite, setDomainTransferData, validateDomainName ] );

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
		initialQuery &&
			! initialMode &&
			! getDomainNameValidationErrorMessage( initialQuery ) &&
			onNext();
	}, [ initialMode, initialQuery, onNext ] );

	useEffect( () => {
		if ( inputMode.transferDomain === mode && inputMode.transferDomain === initialMode )
			setDomainTransferData();
	}, [ mode, setDomainTransferData, initialMode ] );

	const showOwnershipVerificationFlow = () => {
		setMode( inputMode.ownershipVerification );
	};

	const showTransferDomainFlow = () => {
		setMode( inputMode.transferDomain );
	};

	const handleTransfer = () => {
		onTransfer( domainName );
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
				domainInboundTransferStatusInfo={ domainInboundTransferStatusInfo }
				domain={ domainName }
				isSignupStep={ isSignupStep }
				onConnect={
					'auth_code' === domainAvailabilityData?.ownership_verification_type
						? showOwnershipVerificationFlow
						: onConnect
				}
				onTransfer={ onTransfer ?? showTransferDomainFlow }
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
				domainInboundTransferStatusInfo={ domainInboundTransferStatusInfo }
				isFetchingAvailability={ isFetchingAvailability }
				initialMode={ initialMode }
				domain={ domainName }
				initialPageSlug={ transferDomainFlowPageSlug }
				onTransfer={ onTransfer }
				onSetPage={ setTransferDomainFlowPageSlug }
				stepsDefinition={ transferDomainStepsDefinition }
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

	const headerText = useMemo( () => {
		switch ( mode ) {
			case inputMode.domainInput:
				return __( 'Use a domain I own' );
			case inputMode.transferDomain:
				/* translators: %s - the name of the domain the user will add to their site */
				return sprintf( __( 'Transfer %s' ), domainName );
			default:
				/* translators: %s - the name of the domain the user will add to their site */
				return sprintf( __( 'Use a domain I own: %s' ), domainName );
		}
	}, [ domainName, mode, __ ] );

	const renderHeader = () => {
		if ( ! showHeader ) {
			return null;
		}

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
			</>
		);
	};

	return (
		<>
			{ renderHeader() }
			{ renderContent() }
		</>
	);
}

UseMyDomain.defaultProps = {
	isSignupStep: false,
	showHeader: true,
};

UseMyDomain.propTypes = {
	goBack: PropTypes.func.isRequired,
	initialQuery: PropTypes.string,
	isSignupStep: PropTypes.bool,
	onConnect: PropTypes.func,
	onTransfer: PropTypes.func,
	selectedSite: PropTypes.object,
	showHeader: PropTypes.bool,
	transferDomainUrl: PropTypes.string,
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	UseMyDomain
);
