/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	START_WRITING_FLOW,
	ONBOARDING_FLOW,
	StepContainer,
	isStartWritingFlow,
	Step,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { useLocation } from 'react-router';
import QueryProductsList from 'calypso/components/data/query-products-list';
import {
	useMyDomainInputMode as inputMode,
	UseMyDomainInputMode,
} from 'calypso/components/domains/connect-domain-step/constants';
import UseMyDomainComponent from 'calypso/components/domains/use-my-domain';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainMapping, domainTransfer } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

import './style.scss';

const UseMyDomain: StepType< {
	submits:
		| {
				mode: 'transfer' | 'connect';
				domain: string;
		  }
		| undefined;
} > = function UseMyDomain( { navigation, flow } ) {
	const { __ } = useI18n();
	const { setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );
	const { goNext, goBack, submit } = navigation;
	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;
	const location = useLocation();

	const [ useMyDomainMode, setUseMyDomainMode ] = useState< UseMyDomainInputMode >(
		inputMode.domainInput
	);

	const handleGoBack = () => {
		if ( String( getQueryArg( window.location.search, 'step' ) ?? '' ) === 'transfer-or-connect' ) {
			// Force UseMyDomainComponent component to re-render
			setUseMyDomainMode( inputMode.domainInput );
		}
		goBack?.();
	};

	const handleOnTransfer = async ( { domain, authCode }: { domain: string; authCode: string } ) => {
		const domainCartItem = domainTransfer( {
			domain: domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );
		setHideFreePlan( true );
		setDomainCartItem( domainCartItem );

		submit?.( undefined );
	};

	const handleOnConnect = async ( domain: string ) => {
		const domainCartItem = domainMapping( { domain } );
		setHideFreePlan( true );
		setDomainCartItem( domainCartItem );

		submit?.( undefined );
	};

	const getInitialQuery = function () {
		const lastQuery = String( getQueryArg( window.location.search, 'lastQuery' ) ?? '' );
		const initialQuery = String( getQueryArg( window.location.search, 'initialQuery' ) ?? '' );
		return lastQuery || initialQuery;
	};

	const getInitialMode = function () {
		const stepQueryParam = getQueryArg( window.location.search, 'step' );
		if ( stepQueryParam === 'transfer-or-connect' ) {
			return inputMode.transferOrConnect;
		}
		return inputMode.domainInput;
	};

	const handleOnNext = ( { mode, domain }: { mode: 'transfer' | 'connect'; domain: string } ) => {
		submit?.( { mode, domain, shouldSkipSubmitTracking: true } );
	};

	const getBlogOnboardingFlowStepContent = () => {
		return (
			<CalypsoShoppingCartProvider>
				<UseMyDomainComponent
					analyticsSection="signup"
					initialQuery={ getInitialQuery() }
					initialMode={ getInitialMode() }
					isSignupStep
					onTransfer={ handleOnTransfer }
					onConnect={ ( { domain } ) => handleOnConnect( domain ) }
					useMyDomainMode={ useMyDomainMode }
					setUseMyDomainMode={ setUseMyDomainMode }
					onNextStep={ handleOnNext }
					isStepper
					stepLocation={ location }
					registerNowAction={ handleGoBack }
					hideHeader={ shouldUseStepContainerV2( flow ) }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const getStepContent = () => {
		switch ( flow ) {
			case START_WRITING_FLOW:
			case ONBOARDING_FLOW:
				return getBlogOnboardingFlowStepContent();
			default:
				return getDefaultStepContent();
		}
	};

	const shouldHideButtons = isStartWritingFlow( flow );

	if ( shouldUseStepContainerV2( flow ) ) {
		const [ columnWidth, headingText ] =
			useMyDomainMode === 'domain-input'
				? [ 4 as const, __( 'Use a domain I own' ) ]
				: [
						10 as const,
						<>
							{ __( 'Use a domain I own' ) }
							<br />
							{ getInitialQuery() }
						</>,
				  ];

		return (
			<>
				<QueryProductsList />
				<Step.CenteredColumnLayout
					topBar={
						<Step.TopBar
							leftElement={
								shouldHideButtons ? undefined : <Step.BackButton onClick={ handleGoBack } />
							}
						/>
					}
					columnWidth={ columnWidth }
					heading={ <Step.Heading text={ headingText } /> }
				>
					{ getStepContent() }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<QueryProductsList />
			<StepContainer
				stepName="useMyDomain"
				shouldHideNavButtons={ shouldHideButtons }
				goBack={ handleGoBack }
				goNext={ goNext }
				isHorizontalLayout={ false }
				isWideLayout
				isLargeSkipLayout={ false }
				stepContent={ getStepContent() }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default UseMyDomain;
