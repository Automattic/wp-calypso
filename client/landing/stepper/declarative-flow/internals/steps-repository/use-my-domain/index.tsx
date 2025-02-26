/* eslint-disable wpcalypso/jsx-classname-namespace */
import {
	DESIGN_FIRST_FLOW,
	START_WRITING_FLOW,
	ONBOARDING_FLOW,
	StepContainer,
	isStartWritingFlow,
} from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { getQueryArg } from '@wordpress/url';
import { useLocation } from 'react-router';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import UseMyDomainComponent from 'calypso/components/domains/use-my-domain';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainMapping, domainTransfer } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

import './style.scss';

const UseMyDomain: Step = function UseMyDomain( { navigation, flow } ) {
	const { setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );
	const { goNext, goBack, submit } = navigation;
	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;
	const location = useLocation();

	const [ useMyDomainMode, setUseMyDomainMode ] = useState( '' );

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

		submit?.();
	};

	const handleOnConnect = async ( domain: string ) => {
		const domainCartItem = domainMapping( { domain } );
		setHideFreePlan( true );
		setDomainCartItem( domainCartItem );

		submit?.();
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

	const handleOnNext = ( { mode, domain }: { mode: string; domain: string } ) => {
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
					showHeader={ false }
					onTransfer={ handleOnTransfer }
					onConnect={ ( { domain } ) => handleOnConnect( domain ) }
					useMyDomainMode={ useMyDomainMode }
					setUseMyDomainMode={ setUseMyDomainMode }
					onNextStep={ handleOnNext }
					isStepper
					stepLocation={ location }
					registerNowAction={ handleGoBack }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const getStepContent = () => {
		switch ( flow ) {
			case START_WRITING_FLOW:
			case DESIGN_FIRST_FLOW:
			case ONBOARDING_FLOW:
				return getBlogOnboardingFlowStepContent();
			default:
				return getDefaultStepContent();
		}
	};

	return (
		<>
			<QueryProductsList />
			<StepContainer
				stepName="useMyDomain"
				shouldHideNavButtons={ isStartWritingFlow( flow ) }
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
