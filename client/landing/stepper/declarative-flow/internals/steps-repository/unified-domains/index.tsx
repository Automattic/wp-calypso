import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
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
import { useStepperPersistedState } from '../../hooks/use-persisted-state';
import { ProvidedDependencies, StepProps } from '../../types';
import './style.scss';

const RenderDomainsStepConnect = connect(
	( state, { flow }: StepProps ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const selectedSite = getSelectedSite( state );
		const multiDomainDefaultPlan = planItem( PLAN_PERSONAL );
		const userLoggedIn = isUserLoggedIn( state as object );

		return {
			designType: getDesignType( state ),
			currentUser: getCurrentUser( state as object ),
			productsList,
			productsLoaded,
			selectedSite,
			isDomainOnly: false,
			sites: getSitesItems( state ),
			// <this info is used to hide the back button>
			userSiteCount: 0,
			previousStepName: 'user',
			// <this info is used to hide the back button />
			isPlanSelectionAvailableLaterInFlow: true,
			userLoggedIn,
			multiDomainDefaultPlan,
			domainsWithPlansOnly: currentUserHasFlag( state as object, DOMAINS_WITH_PLANS_ONLY ),
			flowName: flow,
			path: window.location.pathname,
			positionInFlow: 1,
			isReskinned: true,
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
	const [ stepState, setStepState ] = useStepperPersistedState< ProvidedDependencies >();

	return (
		<CalypsoShoppingCartProvider>
			<RenderDomainsStepConnect
				{ ...props }
				page={ ( url: string ) => window.location.assign( url ) }
				saveSignupStep={ ( state: ProvidedDependencies ) =>
					setStepState( { ...stepState, ...state } )
				}
				submitSignupStep={ () => props.navigation.submit?.( stepState ) }
				goToNextStep={ () => props.navigation.submit?.( stepState ) }
				step={ stepState }
				flowName={ props.flow }
				CustomStepWrapper={ StepContainer }
			/>
		</CalypsoShoppingCartProvider>
	);
}
