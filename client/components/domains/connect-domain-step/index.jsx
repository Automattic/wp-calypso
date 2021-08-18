/**
 * External dependencies
 */
import { BackButton } from '@automattic/onboarding';
import { __, sprintf } from '@wordpress/i18n';
import page from 'page';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import ConnectDomainStepSupportInfoLink from 'calypso/components/domains/connect-domain-step/connect-domain-step-support-info-link';
import DomainTransferRecommendation from 'calypso/components/domains/domain-transfer-recommendation';
import FormattedHeader from 'calypso/components/formatted-header';
import Gridicon from 'calypso/components/gridicon';
import wpcom from 'calypso/lib/wp';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepSwitchSetupInfoLink from './connect-domain-step-switch-setup-info-link';
import { isMappingVerificationSuccess } from './connect-domain-step-verification-status-parsing.js';
import { modeType, stepType, stepSlug, defaultDomainSetupInfo } from './constants';
import {
	defaultStepsDefinition,
	getPageSlug,
	getProgressStepList,
	getStepsDefinition,
} from './page-definitions';
/**
 * Style dependencies
 */
import './style.scss';

function ConnectDomainStep( { domain, selectedSite, initialSetupInfo, initialStep, showErrors } ) {
	const [ mode, setMode ] = useState( modeType.SUGGESTED );
	const [ step, setStep ] = useState( stepType.START );
	const [ currentPageSlug, setCurrentPageSlug ] = useState( stepSlug.SUGGESTED_START );
	const [ progressStepList, setProgressStepList ] = useState( {} );
	const [ verificationStatus, setVerificationStatus ] = useState( {} );
	const [ verificationInProgress, setVerificationInProgress ] = useState( false );
	const [ domainSetupInfo, setDomainSetupInfo ] = useState( defaultDomainSetupInfo );
	const [ domainSetupInfoError, setDomainSetupInfoError ] = useState( {} );
	const [ loadingDomainSetupInfo, setLoadingDomainSetupInfo ] = useState( false );
	const [ stepsDefinition, setStepsDefinition ] = useState( defaultStepsDefinition );

	const baseClassName = 'connect-domain-step';
	const StepsComponent = stepsDefinition?.[ currentPageSlug ].component;
	const isStepStart = stepType.START === step;

	const statusRef = useRef( {} );

	const setPage = useCallback(
		( pageStepSlug ) => {
			setCurrentPageSlug( pageStepSlug );
			setStep( stepsDefinition[ pageStepSlug ].step );
			setMode( stepsDefinition[ pageStepSlug ].mode );
		},
		[ stepsDefinition ]
	);

	const setNextStep = () => {
		const next = stepsDefinition[ currentPageSlug ]?.next;
		next && setPage( next );
	};

	const switchToSuggestedSetup = () => {
		setPage( stepSlug.SUGGESTED_START );
	};

	const switchToAdvancedSetup = () => {
		setPage( stepSlug.ADVANCED_START );
	};

	useEffect( () => {
		setStepsDefinition( getStepsDefinition( selectedSite, domain, domainSetupInfo ) );
	}, [ domain, domainSetupInfo, selectedSite ] );

	useEffect( () => {
		setCurrentPageSlug( getPageSlug( mode, step, stepsDefinition ) );
	}, [ mode, step, stepsDefinition ] );

	useEffect( () => {
		if ( initialStep && Object.values( stepSlug ).includes( initialStep ) ) {
			setPage( initialStep );
		}
	}, [ initialStep, setPage ] );

	useEffect( () => {
		setProgressStepList( getProgressStepList( mode, stepsDefinition ) );
	}, [ mode, stepsDefinition ] );

	const verifyConnection = useCallback(
		( setStepAfterVerify = true ) => {
			setVerificationStatus( {} );
			setVerificationInProgress( true );
			wpcom
				.domain( domain )
				.mappingStatus()
				.then( ( data ) => {
					setVerificationStatus( { data } );
					if ( setStepAfterVerify ) {
						if ( isMappingVerificationSuccess( mode, data ) ) {
							setStep( stepType.CONNECTED );
						} else {
							setStep( stepType.VERIFYING );
						}
					}
				} )
				.catch( ( error ) => {
					setVerificationStatus( { error } );
					if ( setStepAfterVerify ) {
						setStep( stepType.VERIFYING );
					}
				} )
				.finally( () => setVerificationInProgress( false ) );
		},
		[ mode, domain ]
	);

	useEffect( () => {
		if ( statusRef.current?.hasLoadedStatusInfo?.[ domain ] || loadingDomainSetupInfo ) {
			return;
		}

		( () => {
			setDomainSetupInfoError( {} );
			setLoadingDomainSetupInfo( true );
			wpcom
				.domain()
				.mappingSetupInfo( selectedSite.ID, domain )
				.then( ( data ) => {
					setDomainSetupInfo( { data } );
					statusRef.current.hasLoadedStatusInfo = { [ domain ]: true };
				} )
				.catch( ( error ) => setDomainSetupInfoError( { error } ) )
				.finally( () => setLoadingDomainSetupInfo( false ) );
		} )();
	}, [ domain, domainSetupInfo, initialSetupInfo, loadingDomainSetupInfo, selectedSite.ID ] );

	useEffect( () => {
		if ( ! showErrors || statusRef.current?.hasFetchedVerificationStatus ) {
			return;
		}

		statusRef.current.hasFetchedVerificationStatus = true;
		verifyConnection( false );
	}, [ showErrors, verifyConnection ] );

	const goBack = () => {
		const prevPageSlug = stepsDefinition[ currentPageSlug ]?.prev;

		if ( prevPageSlug ) {
			setPage( prevPageSlug );
		} else {
			page( domainManagementList( selectedSite.slug ) );
		}
	};

	const headerText = sprintf(
		/* translators: %s: domain name being connected (ex.: example.com) */
		__( 'Connect %s' ),
		domain
	);

	return (
		<>
			<BackButton className={ baseClassName + '__go-back' } onClick={ goBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ __( 'Back' ) }
			</BackButton>
			<FormattedHeader
				brandFont
				className={ baseClassName + '__page-heading' }
				headerText={ headerText }
				align="left"
			/>
			<StepsComponent
				className={ baseClassName }
				domain={ domain }
				step={ step }
				mode={ mode }
				onNextStep={ setNextStep }
				onVerifyConnection={ verifyConnection }
				verificationInProgress={ verificationInProgress }
				verificationStatus={ verificationStatus || {} }
				domainSetupInfo={ domainSetupInfo }
				domainSetupInfoError={ domainSetupInfoError }
				onSwitchToAdvancedSetup={ switchToAdvancedSetup }
				onSwitchToSuggestedSetup={ switchToSuggestedSetup }
				progressStepList={ progressStepList }
				currentPageSlug={ currentPageSlug }
				showErrors={ showErrors }
			/>
			{ isStepStart && <DomainTransferRecommendation /> }
			<ConnectDomainStepSupportInfoLink baseClassName={ baseClassName } mode={ mode } />
			<ConnectDomainStepSwitchSetupInfoLink
				baseClassName={ baseClassName }
				currentMode={ mode }
				currentStep={ step }
				setPage={ setPage }
				onSwitchToAdvancedSetup={ switchToAdvancedSetup }
				onSwitchToSuggestedSetup={ switchToSuggestedSetup }
			/>
		</>
	);
}

ConnectDomainStep.propTypes = {
	domain: PropTypes.string.isRequired,
	selectedSite: PropTypes.object,
	initialStep: PropTypes.string,
	showErrors: PropTypes.bool,
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	ConnectDomainStep
);
