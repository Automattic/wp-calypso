import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { useStepPersistedState } from '@automattic/onboarding';
import { withShoppingCart } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { useRef, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import { planItem } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { RenderDomainsStep, submitDomainStepSelection } from 'calypso/signup/steps/domains';
import {
	wasSignupCheckoutPageUnloaded,
	retrieveSignupDestination,
	getSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import {
	currentUserHasFlag,
	getCurrentUser,
	getCurrentUserSiteCount,
	isUserLoggedIn,
} from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'calypso/state/domains/actions';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { fetchUsernameSuggestion } from 'calypso/state/signup/optional-dependencies/actions';
import { removeStep } from 'calypso/state/signup/progress/actions';
import { setDesignType } from 'calypso/state/signup/steps/design-type/actions';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { ProvidedDependencies, StepProps } from '../../types';
import { useIsManagedSiteFlowProps } from './use-is-managed-site-flow';

const RenderDomainsStepConnect = connect(
	( state, { flow }: StepProps ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const multiDomainDefaultPlan = planItem( PLAN_PERSONAL );
		const userLoggedIn = isUserLoggedIn( state as object );
		const currentUserSiteCount = getCurrentUserSiteCount( state as object );
		const stepSectionName = window.location.pathname.includes( 'use-your-domain' )
			? 'use-your-domain'
			: undefined;

		return {
			designType: getDesignType( state ),
			currentUser: getCurrentUser( state as object ),
			productsList,
			productsLoaded,
			isDomainOnly: false,
			sites: getSitesItems( state ),
			userSiteCount: currentUserSiteCount,
			previousStepName: 'user',
			isPlanSelectionAvailableLaterInFlow: true,
			userLoggedIn,
			multiDomainDefaultPlan,
			domainsWithPlansOnly: currentUserHasFlag( state as object, DOMAINS_WITH_PLANS_ONLY ),
			flowName: flow,
			path: window.location.pathname,
			positionInFlow: 1,
			isReskinned: true,
			stepSectionName,
		};
	},
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		recordUseYourDomainButtonClick,
		removeStep,
		submitDomainStepSelection,
		setDesignType,
		recordTracksEvent,
		fetchUsernameSuggestion,
	}
)( withCartKey( withShoppingCart( localize( RenderDomainsStep ) ) ) );

export default function DomainsStep( props: StepProps ) {
	const [ stepState, setStepState ] =
		useStepPersistedState< ProvidedDependencies >( 'domains-step' );
	const managedSiteFlowProps = useIsManagedSiteFlowProps();

	const mostRecentStateRef = useRef< ProvidedDependencies | undefined >( undefined );

	const updateSignupStepState = useCallback(
		( state: ProvidedDependencies, providedDependencies: ProvidedDependencies ) => {
			setStepState(
				( mostRecentStateRef.current = { ...stepState, ...providedDependencies, ...state } )
			);
		},
		[ stepState, setStepState ]
	);
	useEffect( () => {
		// This will automatically submit the domains step when navigating back from checkout
		// It will redirect the user to plans step. The idea is to achieve the same behavior as /start.
		const signupDestinationCookieExists = retrieveSignupDestination();
		const isReEnteringFlow = getSignupCompleteFlowName() === props.flow;
		const isManageSiteFlow = Boolean(
			wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow
		);
		if ( isManageSiteFlow ) {
			if ( Object.keys( stepState ).length > 0 ) {
				props.navigation.submit?.( stepState );
			}
		}
	} );

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainsStepConnect
				{ ...props }
				{ ...managedSiteFlowProps }
				page={ ( url: string ) => window.location.assign( url ) }
				saveSignupStep={ updateSignupStepState }
				submitSignupStep={ updateSignupStepState }
				goToNextStep={ ( state: ProvidedDependencies ) => {
					const { domainForm, ...rest } = mostRecentStateRef.current ?? {};
					props.navigation.submit?.( { ...rest, ...state } );
				} }
				step={ stepState }
				flowName={ props.flow }
				useStepperWrapper
			/>
		</CalypsoShoppingCartProvider>
	);
}
