import { OnboardSelect } from '@automattic/data-stores';
import { StepContainer, usePersistedState } from '@automattic/onboarding';
import { useSelect, useDispatch as useWPDispatch } from '@wordpress/data';
import { localize } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { PlansStep } from 'calypso/signup/steps/plans';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { ProvidedDependencies, StepProps } from '../../types';
import './styles.scss';

export const LocalizedPlanStep = localize( PlansStep );

export default function PlansStepAdaptor( props: StepProps ) {
	const [ stepState, setStepState ] = usePersistedState< ProvidedDependencies >();
	const siteSlug = useSiteSlug();
	const { siteTitle, domainItem, domainItems } = useSelect(
		( select: ( key: string ) => OnboardSelect ) => {
			return {
				siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
				domainItem: select( ONBOARD_STORE ).getDomainCartItem(),
				domainItems: select( ONBOARD_STORE ).getDomainCartItems(),
			};
		},
		[]
	);
	const username = useSelector( getCurrentUserName );
	const coupon = undefined;

	const { setDomainCartItem, setDomainCartItems } = useWPDispatch( ONBOARD_STORE );

	const signupDependencies = {
		siteSlug,
		siteTitle,
		username,
		coupon,
		domainItem,
		domainCart: domainItems,
	};

	const site = useSite();
	const customerType = useQuery().get( 'customerType' );
	const dispatch = useDispatch();

	/**
	 * The plans step has a quirk where it calls `submitSignupStep` then synchronously calls `goToNextStep` after it.
	 * This doesn't give `setStepState` a chance to update and the data is not passed to `submit`.
	 */
	let mostRecentState: ProvidedDependencies;

	return (
		<LocalizedPlanStep
			selectedSite={ site }
			saveSignupStep={ ( state: ProvidedDependencies ) => {
				setStepState( ( mostRecentState = { ...stepState, ...state } ) );
			} }
			submitSignupStep={ ( state: ProvidedDependencies ) => {
				/* The plans step removes paid domains domains when the user picks a free plan
				   after picking a paid domain */
				if ( state.stepName === 'domains' ) {
					setDomainCartItem( undefined );
					setDomainCartItems( undefined );
				} else {
					setStepState( { ...stepState, ...state } );
					props.navigation.submit?.(
						( mostRecentState = { ...stepState, ...state, ...mostRecentState } )
					);
				}
			} }
			goToNextStep={ () => props.navigation.submit?.( { ...stepState, ...mostRecentState } ) }
			step={ stepState }
			customerType={ customerType }
			errorNotice={ ( message: string ) => dispatch( errorNotice( message ) ) }
			signupDependencies={ signupDependencies }
			stepName="plans"
			flowName={ props.flow }
			renderWithoutStepWrapper
			recordTracksEvent={ ( event: unknown ) => dispatch( recordTracksEvent( event ) ) }
			CustomStepWrapper={ usePlanStepWrapper( props.navigation ) }
		/>
	);
}

function usePlanStepWrapper( navigation: StepProps[ 'navigation' ] ) {
	const dispatch = useDispatch();

	return ( props: Parameters< typeof StepContainer >[ 0 ] ) => (
		<StepContainer
			{ ...props }
			goBack={ navigation.goBack }
			recordTracksEvent={ ( event: unknown ) => dispatch( recordTracksEvent( event ) ) }
			isFullLayout
			isExtraWideLayout={ false }
		/>
	);
}
