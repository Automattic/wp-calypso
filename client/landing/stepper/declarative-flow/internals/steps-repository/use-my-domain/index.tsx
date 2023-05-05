/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { getQueryArg } from '@wordpress/url';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import UseMyDomainComponent from 'calypso/components/domains/use-my-domain';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainMapping, domainTransfer } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

import './style.scss';

const UseMyDomain: Step = function UseMyDomain( { navigation, flow } ) {
	const { setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const isStartWritingFlow = 'start-writing' === flow;
	const { setDomain } = useDispatch( ONBOARD_STORE );
	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onAddDomain = ( selectedDomain: any ) => {
		setDomain( selectedDomain );
		submit?.( { domain: selectedDomain } );
	};

	const onSkip = () => {
		onAddDomain( null );
	};

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
					hideHeader={ true }
					onTransfer={ handleOnTransfer }
					onConnect={ handleOnConnect }
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

	const getFormattedHeader = () => {
		if ( isStartWritingFlow ) {
			return (
				<FormattedHeader
					id="choose-a-domain-writer-header"
					headerText={ __( 'Use a domain I own' ) }
					subHeaderText={
						<>
							{ __( 'Help your blog stand out with a custom domain. Not sure yet?' ) }
							<button
								className="button navigation-link step-container__navigation-link has-underline is-borderless"
								onClick={ onSkip }
							>
								{ __( 'Decide later.' ) }
							</button>
						</>
					}
					align="center"
				/>
			);
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
				formattedHeader={ getFormattedHeader() }
			/>
		</>
	);
};

export default UseMyDomain;
