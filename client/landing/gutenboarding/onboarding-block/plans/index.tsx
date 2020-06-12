/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import PlansGrid from '@automattic/plans-grid';

/**
 * Internal dependencies
 */
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import { useTrackStep } from '../../hooks/use-track-step';
import useStepNavigation from '../../hooks/use-step-navigation';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import ActionButtons, { BackButton } from '../../components/action-buttons';
import { Title, SubTitle } from '../../components/titles';

interface Props {
	isModal?: boolean;
}

const PlansStep: React.FunctionComponent< Props > = ( { isModal } ) => {
	const { __ } = useI18n();
	const history = useHistory();
	const { goBack, goNext } = useStepNavigation();

	const plan = useSelectedPlan();

	//@TODO: do the same for domains step
	const { setHasUsedPlansStep } = useDispatch( ONBOARD_STORE );
	React.useEffect( () => {
		! isModal && setHasUsedPlansStep( true );
	}, [] );

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = React.useRef< string | undefined >();
	React.useEffect( () => {
		selectedPlanRef.current = plan?.storeSlug;
	}, [ plan ] );

	useTrackStep( isModal ? 'PlansModal' : 'Plans', () => ( {
		selected_plan: selectedPlanRef.current,
	} ) );

	const handleBack = () => ( isModal ? history.goBack() : goBack() );
	const handlePlanSelect = () => {
		if ( isModal ) {
			history.goBack();
		} else {
			goNext();
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
		</div>
	);
};

export default PlansStep;
