import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { useStepPersistedState } from '@automattic/onboarding';
import { withShoppingCart } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import { planItem } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { RenderDomainsStep, submitDomainStepSelection } from 'calypso/signup/steps/domains';
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
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { ProvidedDependencies, StepProps } from '../../types';

const RenderDomainsStepConnect = connect(
	( state, { flow }: StepProps ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const selectedSite = getSelectedSite( state );
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
			selectedSite,
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

	/**
	 * The domains step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
	 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
	 * This also happens in Plans step https://github.com/Automattic/wp-calypso/blob/trunk/client/landing/stepper/declarative-flow/internals/steps-repository/unified-plans/index.tsx#L68
	 */
	let mostRecentState: ProvidedDependencies;

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainsStepConnect
				{ ...props }
				page={ ( url: string ) => window.location.assign( url ) }
				saveSignupStep={ ( state: ProvidedDependencies ) =>
					setStepState( ( mostRecentState = { ...stepState, ...state } ) )
				}
				submitSignupStep={ ( state: ProvidedDependencies ) => {
					setStepState( ( mostRecentState = { ...stepState, ...state } ) );
				} }
				goToNextStep={ ( state: ProvidedDependencies ) => {
					props.navigation.submit?.( { ...stepState, ...state, ...mostRecentState } );
				} }
				step={ stepState }
				flowName={ props.flow }
				useStepperWrapper
			/>
		</CalypsoShoppingCartProvider>
	);
}
