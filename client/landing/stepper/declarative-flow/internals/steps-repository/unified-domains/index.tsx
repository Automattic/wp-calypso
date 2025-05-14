import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { DomainSuggestion } from '@automattic/data-stores';
import { useStepPersistedState } from '@automattic/onboarding';
import { withShoppingCart, type ResponseCartProduct } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import { planItem } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { RenderDomainsStep, submitDomainStepSelection } from 'calypso/signup/steps/domains';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
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
import { useIsManagedSiteFlowProps } from './use-is-managed-site-flow';
import type { ProvidedDependencies, Step } from '../../types';

type DomainStepSubmittedTypes = {
	stepName?: 'domains';
	suggestion?: DomainSuggestion;
	shouldHideFreePlan?: boolean;
	signupDomainOrigin?: string;
	siteUrl?: string;
	lastDomainSearched?: string;
	domainCart?: ResponseCartProduct[] | object;
	shouldSkipSubmitTracking?: boolean;
	domainItem?: DomainSuggestion;
	navigateToUseMyDomain?: boolean;
	domainForm?: {
		lastQuery?: string;
	};
};

const RenderDomainsStepConnect = connect(
	( state, { flow, step }: { flow: string; step: ProvidedDependencies } ) => {
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
			domainsWithPlansOnly: getCurrentUser( state as object )
				? currentUserHasFlag( state as object, NON_PRIMARY_DOMAINS_TO_FREE_USERS ) // this is intentional, not a mistake
				: true,
			flowName: flow,
			path: window.location.pathname,
			positionInFlow: 1,
			stepSectionName,
			signupDependencies: step,
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

/**
 * The domains step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
 */
let mostRecentState: ProvidedDependencies = {};

const DomainsStep: Step< { submits: DomainStepSubmittedTypes } > = ( { navigation, ...props } ) => {
	const [ stepState, setStepState ] =
		useStepPersistedState< ProvidedDependencies >( 'domains-step' );
	const managedSiteFlowProps = useIsManagedSiteFlowProps();

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainsStepConnect
				{ ...props }
				{ ...managedSiteFlowProps }
				{ ...navigation }
				page={ ( url: string ) => window.location.assign( url ) }
				saveSignupStep={ ( step: ProvidedDependencies ) => {
					setStepState( ( mostRecentState = { ...stepState, ...step } ) );
				} }
				submitSignupStep={ ( _: never, step: ProvidedDependencies ) => {
					setStepState( ( mostRecentState = { ...stepState, ...step } ) );
				} }
				goToNextStep={ ( state: ProvidedDependencies ) => {
					navigation.submit?.( {
						...mostRecentState,
						...state,
						shouldSkipSubmitTracking: state?.navigateToUseMyDomain ? true : false,
					} );
				} }
				step={ stepState }
				flowName={ props.flow }
				useStepperWrapper
			/>
		</CalypsoShoppingCartProvider>
	);
};

export default DomainsStep;
