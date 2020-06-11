/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import PlansGrid from '@automattic/plans-grid';

/**
 * Internal dependencies
 */
import SignupForm from '../../components/signup-form';
import {
	useSelectedPlan,
	useShouldSiteBePublicOnSelectedPlan,
} from '../../hooks/use-selected-plan';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import ActionButtons, { BackButton } from '../../components/action-buttons';
import { Title, SubTitle } from '../../components/titles';

interface Props {
	isModal?: boolean;
}

const PlansStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __ } = useI18n();
	const history = useHistory();
	const { previousStepPath } = useStepNavigation();

	const [ showSignupDialog, setShowSignupDialog ] = React.useState( false );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const { createSite } = useDispatch( ONBOARD_STORE );
	const { setHasUsedPlansStep } = useDispatch( ONBOARD_STORE );
	const plan = useSelectedPlan();
	const shouldSiteBePublic = useShouldSiteBePublicOnSelectedPlan();

	const freeDomainSuggestion = useFreeDomainSuggestion();

	React.useEffect( () => {
		setHasUsedPlansStep( true );
	}, [] );

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();
	React.useEffect( () => {
		selectedPlanRef.current = plan?.storeSlug;
	}, [ plan ] );

	useTrackStep( isModal ? 'PlansModal' : 'Plans', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const handleBack = () => ( isModal ? history.goBack() : history.push( previousStepPath ) );
	const handlePlanSelect = () => {
		if ( isModal ) {
			history.goBack();
		} else {
			currentUser
				? createSite( currentUser.username, freeDomainSuggestion, undefined, shouldSiteBePublic )
				: setShowSignupDialog( true );
		}
	};

	const header = (
		<>
			<div>
				<Title>{ __( 'Choose a plan' ) }</Title>
				<SubTitle>
					{ __(
						'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.'
					) }
				</SubTitle>
			</div>
			<ActionButtons>
				<BackButton onClick={ handleBack } />
			</ActionButtons>
		</>
	);

	return (
		<div className="gutenboarding-page plans">
			<PlansGrid header={ header } onPlanSelect={ handlePlanSelect } />
			{ showSignupDialog && <SignupForm onRequestClose={ () => setShowSignupDialog( false ) } /> }
		</div>
	);
};

export default PlansStep;
