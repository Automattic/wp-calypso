import { Gridicon } from '@automattic/components';
import { useSiteDomainsQuery } from '@automattic/data-stores';
import { BackButton } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArgs } from '@wordpress/url';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import ConnectDomainSteps from 'calypso/components/domains/connect-domain-step/connect-domain-steps';
import {
	domainLockStatusType,
	stepSlug,
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
import { getWpcomRegistrationStatus } from 'calypso/lib/domains/get-wpcom-registration-status';
import wpcom from 'calypso/lib/wp';
import { fetchSiteDomains } from 'calypso/my-sites/domains/domain-management/domains-table-fetch-functions';
import { isUpdatingPrimaryDomain } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import UseMyDomainInput from './domain-input';
import DomainTransferOrConnect from './transfer-or-connect';

import './style.scss';

function UseMyDomain( props ) {
	const {
		goBack,
		initialQuery,
		isSignupStep = false,
		onConnect,
		onTransfer,
		selectedSite,
		transferDomainUrl,
		initialMode,
		onNextStep,
		onSkip,
		updatingPrimaryDomain,
		useMyDomainMode,
		setUseMyDomainMode,
		isStepper = false,
		stepLocation,
		registerNowAction,
	} = props;

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
	const { isFetchingSiteDomains } = useSiteDomainsQuery( selectedSite?.ID, {
		queryFn: () => fetchSiteDomains( selectedSite?.ID ),
	} );

	const isBusy = isFetchingAvailability || isFetchingSiteDomains || updatingPrimaryDomain;

	const baseClassName = 'use-my-domain';

	const updateMode = useCallback(
		( newMode ) => {
			setMode( newMode );
			if ( isStepper ) {
				setUseMyDomainMode?.( newMode );
			}
		},
		[ isStepper, setUseMyDomainMode ]
	);

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
					updateMode( inputMode.transferOrConnect );
				}
				return;
			case inputMode.transferDomain:
				if ( prevTransferDomainStepsDefinition ) {
					setTransferDomainFlowPageSlug( prevTransferDomainStepsDefinition );
				} else {
					if ( wasInitialModeSet ) {
						return goBack();
					}
					updateMode( inputMode.transferOrConnect );
				}
				return;
			case inputMode.transferOrConnect:
				updateMode( inputMode.domainInput );
				return;
			default:
				goBack();
		}
	};

	const validateDomainName = useCallback( ( domain ) => {
		const errorMessage = getDomainNameValidationErrorMessage( domain );
		setDomainNameValidationError( errorMessage );
		return ! errorMessage;
	}, [] );

	const filterDomainName = useCallback( ( domain ) => {
		return domain.replace( /(?:^http(?:s)?:)?(?:[/]*)(?:www\.)?([^/?]*)(?:.*)$/gi, '$1' );
	}, [] );

	const getWpcomAvailabilityErrors = useCallback( async () => {
		const filteredDomainName = filterDomainName( domainName );
		const wpRegistrationCheckData = await getWpcomRegistrationStatus(
			filteredDomainName,
			selectedSite?.ID
		);

		if ( ! wpRegistrationCheckData ) {
			return null;
		}

		return {
			availabilityData: wpRegistrationCheckData,
			errorMessage: getAvailabilityErrorMessage( {
				availabilityData: wpRegistrationCheckData,
				domainName: filteredDomainName,
				selectedSite,
				registerNowAction,
			} ),
		};
	}, [ filterDomainName, domainName, selectedSite, registerNowAction ] );

	const getAvailability = useCallback( async () => {
		const filteredDomainName = filterDomainName( domainName );
		const wpcomAvailabilityErrors = await getWpcomAvailabilityErrors();

		if ( wpcomAvailabilityErrors ) {
			return wpcomAvailabilityErrors;
		}

		const availabilityData = await wpcom
			.domain( filteredDomainName )
			.isAvailable( { apiVersion: '1.3', blog_id: selectedSite?.ID, is_cart_pre_check: false } );

		return {
			availabilityData,
			errorMessage: getAvailabilityErrorMessage( {
				availabilityData,
				domainName: filteredDomainName,
				selectedSite,
				registerNowAction,
			} ),
		};
	}, [
		filterDomainName,
		domainName,
		getWpcomAvailabilityErrors,
		selectedSite,
		registerNowAction,
	] );

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
		const inboundTransferStatusResult = await wpcom.req
			.get( `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status` )
			.catch( () => ( {} ) );

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
		const filteredDomainName = filterDomainName( domainName );
		if ( ! validateDomainName( filteredDomainName ) ) {
			return;
		}

		setIsFetchingAvailability( true );
		setDomainAvailabilityData( null );

		try {
			const { availabilityData, errorMessage } = await getAvailability();

			setDomainName( filteredDomainName );
			await setDomainTransferData();

			if ( errorMessage ) {
				setDomainNameValidationError( errorMessage );
			} else {
				onNextStep?.( { mode: inputMode.transferOrConnect, domain: filteredDomainName } );
				setDomainAvailabilityData( availabilityData );
				updateMode( inputMode.transferOrConnect );
			}
		} catch ( error ) {
			setDomainNameValidationError( error.message );
		} finally {
			setIsFetchingAvailability( false );
		}
	}, [
		filterDomainName,
		domainName,
		validateDomainName,
		getAvailability,
		setDomainTransferData,
		onNextStep,
		updateMode,
	] );

	const onDomainNameChange = ( event ) => {
		setDomainName( event.target.value.trim() );
		domainNameValidationError && setDomainNameValidationError();
	};

	const onClearInput = () => {
		setDomainName( '' );
		setDomainNameValidationError();
	};

	const showOwnershipVerificationFlow = () => {
		onNextStep?.( { mode: inputMode.ownershipVerification, domain: domainName } );
		updateMode( inputMode.ownershipVerification );
	};

	const showTransferDomainFlow = () => {
		onNextStep?.( { mode: inputMode.transferDomain, domain: domainName } );
		updateMode( inputMode.transferDomain );
	};

	const renderDomainInput = () => {
		return (
			<UseMyDomainInput
				baseClassName={ baseClassName }
				domainName={ domainName }
				isBusy={ isBusy }
				isSignupStep={ isSignupStep }
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
				onSkip={ onSkip }
				onTransfer={ onTransfer ?? showTransferDomainFlow }
				transferDomainUrl={ transferDomainUrl }
			/>
		);
	};

	const renderOwnershipVerificationFlow = () => {
		return (
			<ConnectDomainSteps
				baseClassName="connect-domain-step"
				domain={ domainName }
				initialPageSlug={ ownershipVerificationFlowPageSlug }
				isOwnershipVerificationFlow
				onConnect={ onConnect }
				onSetPage={ setOwnershipVerificationFlowPageSlug }
				stepsDefinition={ connectADomainOwnershipVerificationStepsDefinition }
			/>
		);
	};

	const renderTransferDomainFlow = () => {
		return (
			<ConnectDomainSteps
				baseClassName="connect-domain-step"
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
			case inputMode.startPendingTransfer:
				return renderTransferDomainFlow();
		}
	};

	const headerText = useMemo( () => {
		switch ( mode ) {
			case inputMode.domainInput:
				return __( 'Use a domain I own' );
			case inputMode.transferDomain:
				return createInterpolateElement(
					sprintf(
						/* translators: %(domainName)s - the name of the domain the user will add to their site */
						__( 'Transfer <span>%(domainName)s</span>' ),
						{
							domainName,
						}
					),
					{
						span: <span />,
					}
				);

			default:
				return createInterpolateElement(
					sprintf(
						/* translators: %(domainName)s - the name of the domain the user will add to their site */
						__( 'Use a domain I own: <span>%(domainName)s</span>' ),
						{
							domainName,
						}
					),
					{
						span: <span />,
					}
				);
		}
	}, [ domainName, mode, __ ] );

	const renderHeader = () => {
		return (
			<>
				{ goBack && (
					<BackButton className={ baseClassName + '__go-back' } onClick={ onGoBack }>
						<Gridicon icon="arrow-left" size={ 18 } />
						{ __( 'Back' ) }
					</BackButton>
				) }
				<FormattedHeader
					brandFont
					className={ baseClassName + '__page-heading' }
					headerText={ headerText }
				/>
			</>
		);
	};

	useEffect( () => {
		if ( useMyDomainMode && mode !== useMyDomainMode && isStepper ) {
			setMode( useMyDomainMode );
		}
	}, [ useMyDomainMode, mode, isStepper ] );

	useEffect( () => {
		if ( initialMode ) {
			setMode( initialMode );
		}
	}, [ initialMode ] );

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
		if ( inputMode.transferDomain === mode && inputMode.transferDomain === initialMode ) {
			setDomainTransferData();
		}
	}, [ mode, setDomainTransferData, initialMode ] );

	useEffect( () => {
		if ( isStepper && stepLocation ) {
			const queryArgs = getQueryArgs( stepLocation.search );
			if ( queryArgs?.step === 'transfer-or-connect' ) {
				updateMode( inputMode.transferOrConnect );
			} else if ( ! queryArgs?.step || queryArgs?.step === 'domain-input' ) {
				updateMode( inputMode.domainInput );
			}
		}
	}, [ stepLocation, updateMode, isStepper ] );

	return (
		<>
			{ renderHeader() }
			{ renderContent() }
		</>
	);
}

UseMyDomain.propTypes = {
	goBack: PropTypes.func,
	initialQuery: PropTypes.string,
	isSignupStep: PropTypes.bool,
	showHeader: PropTypes.bool,
	onConnect: PropTypes.func,
	onTransfer: PropTypes.func,
	onNextStep: PropTypes.func,
	selectedSite: PropTypes.object,
	transferDomainUrl: PropTypes.string,
	analyticsSection: PropTypes.string,
	initialMode: PropTypes.string,
	onSkip: PropTypes.func,
	useMyDomainMode: PropTypes.string,
	setUseMyDomainMode: PropTypes.func,
	isStepper: PropTypes.bool,
	stepLocation: PropTypes.object,
	registerNowAction: PropTypes.func,
};

export default connect( ( state ) => ( {
	selectedSite: getSelectedSite( state ),
	updatingPrimaryDomain: isUpdatingPrimaryDomain( state, getSelectedSite( state )?.ID ),
} ) )( UseMyDomain );
