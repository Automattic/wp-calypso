/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { connect } from 'react-redux';
import page from 'page';
import { BackButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import { modeType, stepType, stepSlug, defaultDomainSetupInfo } from './constants';
import {
	defaultStepsDefinition,
	getPageSlug,
	getProgressStepList,
	getStepsDefinition,
} from './page-definitions';
import ConnectDomainStepSwitchSetupInfoLink from './connect-domain-step-switch-setup-info-link';
import ConnectDomainStepSupportInfoLink from 'calypso/components/domains/connect-domain-step/connect-domain-step-support-info-link';
import DomainTransferRecommendation from 'calypso/components/domains/domain-transfer-recommendation';
import Gridicon from 'calypso/components/gridicon';
import wp from 'calypso/lib/wp';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { isMappingVerificationSuccess } from './connect-domain-step-verification-status-parsing.js';

/**
 * Style dependencies
 */
import './style.scss';

function ConnectDomainStep( { domain, selectedSite, initialSetupInfo, initialStep } ) {
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

	const verifyConnection = () => {
		setVerificationStatus( {} );
		setVerificationInProgress( true );
		wp.undocumented()
			.getMappingStatus( domain )
			.then( ( data ) => {
				setVerificationStatus( { data } );
				if ( isMappingVerificationSuccess( mode, data ) ) {
					setStep( stepType.CONNECTED );
				} else {
					setStep( stepType.VERIFYING );
				}
			} )
			.catch( ( error ) => {
				setVerificationStatus( { error } );
				setStep( stepType.VERIFYING );
			} )
			.finally( () => setVerificationInProgress( false ) );
	};

	const hasLoadedDomainSetupInfo = useRef( null );
	useEffect( () => {
		if ( domain === hasLoadedDomainSetupInfo.current || loadingDomainSetupInfo ) {
			return;
		}

		( () => {
			setDomainSetupInfoError( {} );
			setLoadingDomainSetupInfo( true );
			wp.undocumented()
				.getMappingSetupInfo( selectedSite.ID, domain )
				.then( ( data ) => {
					setDomainSetupInfo( { data } );
					hasLoadedDomainSetupInfo.current = domain;
				} )
				.catch( ( error ) => setDomainSetupInfoError( { error } ) )
				.finally( () => setLoadingDomainSetupInfo( false ) );
		} )();
	}, [ domain, domainSetupInfo, initialSetupInfo, loadingDomainSetupInfo, selectedSite.ID ] );

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
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	ConnectDomainStep
);
