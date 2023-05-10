/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useDispatch } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { StepContainer } from 'calypso/../packages/onboarding/src';
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
	const isStartWritingFlow = 'start-writing' === flow;
	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	const handleOnTransfer = async ( domain: string, authCode: string ) => {
		const domainCartItem = domainTransfer( {
			domain,
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
		return String( getQueryArg( window.location.search, 'lastQuery' ) ?? '' );
	};

	const getStartWritingFlowStepContent = () => {
		return (
			<CalypsoShoppingCartProvider>
				<UseMyDomainComponent
					analyticsSection="signup"
					basePath=""
					initialQuery={ getInitialQuery() }
					initialMode={ inputMode.domainInput }
					isSignupStep={ true }
					showHeader={ false }
					onTransfer={ handleOnTransfer }
					onConnect={ ( { domain } ) => handleOnConnect( domain ) }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const getStepContent = () => {
		switch ( flow ) {
			case 'start-writing':
				return getStartWritingFlowStepContent();
			default:
				return getDefaultStepContent();
		}
	};

	return (
		<>
			<QueryProductsList />
			<StepContainer
				stepName="useMyDomain"
				shouldHideNavButtons={ isStartWritingFlow }
				goBack={ goBack }
				goNext={ goNext }
				isHorizontalLayout={ false }
				isWideLayout={ true }
				isLargeSkipLayout={ false }
				stepContent={ getStepContent() }
				recordTracksEvent={ recordTracksEvent }
				formattedHeader={ undefined }
			/>
		</>
	);
};

export default UseMyDomain;
