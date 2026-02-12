import { StepContainer, isStartWritingFlow, Step } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import QueryProductsList from 'calypso/components/data/query-products-list';
import {
	useMyDomainInputMode as inputMode,
	UseMyDomainInputMode,
} from 'calypso/components/domains/connect-domain-step/constants';
import UseMyDomainComponent from 'calypso/components/domains/use-my-domain';
import { dashboardLink, dashboardOrigins } from 'calypso/dashboard/utils/link';
import { isRelativeUrl } from 'calypso/dashboard/utils/url';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainMapping, domainTransfer } from 'calypso/lib/cart-values/cart-items';
import wpcom from 'calypso/lib/wp';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { useQuery } from '../../../../hooks/use-query';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';

import './style.scss';

type OwnershipVerificationData = {
	ownership_verification_data: {
		verification_type: 'auth_code';
		verification_data: string;
	};
};

const UseMyDomain: StepType< {
	submits:
		| {
				mode: 'transfer' | 'connect';
				domain: string;
		  }
		| {
				domainCartItem: MinimalRequestCartProduct;
		  }
		| {
				skipToPlan: true;
		  }
		| {
				ownershipVerificationCompleted: true;
				domain: string;
		  }
		| undefined;
} > = function UseMyDomain( { navigation, flow } ) {
	const { __ } = useI18n();
	const { goNext, goBack, submit } = navigation;
	const location = useLocation();
	const { site } = useSiteData();
	const backTo = useQuery().get( 'back_to' ) ?? '';
	const userSiteCount = useSelector( getCurrentUserSiteCount );
	const dashboardOptIn = useSelector( hasDashboardOptIn );

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

	const clearQueryParams = () => {
		const { pathname, search, hash } = window.location;
		const newURL = removeQueryArgs( pathname + search + hash, 'step', 'initialQuery', 'lastQuery' );
		window.history.replaceState( {}, document.title, newURL );
	};

	const handleOnTransfer = async ( { domain, authCode }: { domain: string; authCode: string } ) => {
		const domainCartItem = domainTransfer( {
			domain: domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );

		clearQueryParams();
		submit?.( { domainCartItem } );
	};

	const handleOnConnect = async (
		{ domain, verificationData }: { domain: string; verificationData?: OwnershipVerificationData },
		onDone?: ( error?: Error ) => void
	) => {
		const domainCartItem = domainMapping( { domain } );

		// If there's verification data and the site has a paid plan, validate it before submitting
		if ( verificationData && site ) {
			const hasPaidPlan = siteHasPaidPlan( site );

			if ( hasPaidPlan ) {
				try {
					// Validate the auth code by making the API call
					await wpcom.req.post( `/sites/${ site.ID }/add-domain-mapping`, {
						domain,
						...verificationData,
					} );
					submit( { ownershipVerificationCompleted: true, domain } );
				} catch ( error ) {
					// Validation failed - call onDone to display error and stay on current step
					if ( onDone ) {
						const errorObj =
							error instanceof Error
								? error
								: new Error( typeof error === 'string' ? error : 'An error occurred' );
						onDone( errorObj );
					}
					// Don't submit the step - stay on current step to allow retry
					return;
				}
			}
		}

		clearQueryParams();
		submit?.( { domainCartItem } );
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

	const handleOnSkip = () => {
		// When user needs to purchase a plan to connect domain with ownership verification
		submit?.( { skipToPlan: true } );
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
					onConnect={ handleOnConnect }
					onSkip={ handleOnSkip }
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

	const shouldHideButtons = isStartWritingFlow( flow );

	if ( shouldUseStepContainerV2( flow ) ) {
		let columnWidth;
		let headingText;
		let subText;

		if ( useMyDomainMode === 'domain-input' ) {
			columnWidth = 4 as const;
			headingText = __( 'Your domain name' );
			subText = __( 'Enter the domain name your visitors already know.' );
		} else {
			columnWidth = 6 as const;
			headingText = __( 'Use a domain name I own' );
			subText = __( 'Make your domain name part of something bigger.' );
		}

		const getTopBarLeftElement = () => {
			if ( shouldHideButtons ) {
				return undefined;
			}

			if ( goBack ) {
				return <Step.BackButton onClick={ handleGoBack } />;
			}

			const isSafeBackTo =
				isRelativeUrl( backTo ) ||
				dashboardOrigins().some( ( origin ) => backTo?.startsWith( origin ) );

			if ( isSafeBackTo ) {
				return <Step.BackButton href={ backTo } />;
			}

			if ( userSiteCount && userSiteCount > 1 ) {
				return (
					<Step.BackButton href={ dashboardOptIn ? dashboardLink( '/sites' ) : '/sites' }>
						{ __( 'Back to sites' ) }
					</Step.BackButton>
				);
			}

			return <Step.BackButton href="/home">{ __( 'Back to My Home' ) }</Step.BackButton>;
		};

		return (
			<>
				<QueryProductsList />
				<Step.CenteredColumnLayout
					topBar={ <Step.TopBar leftElement={ getTopBarLeftElement() } /> }
					columnWidth={ columnWidth }
					heading={ <Step.Heading text={ headingText } subText={ subText } /> }
					verticalAlign="center"
					className="use-my-domain--redesign"
				>
					{ getBlogOnboardingFlowStepContent() }
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
				stepContent={ getBlogOnboardingFlowStepContent() }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default UseMyDomain;
