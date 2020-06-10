/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
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
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { usePath, Step } from '../../path';
import ActionButtons from '../../components/action-buttons';
import { Title, SubTitle } from '../../components/titles';

export default function PlansStep() {
	const { __ } = useI18n();
	const makePath = usePath();

	const location = useLocation() as any;
	const isModal = location.state?.fromPlansButton;
	const history = useHistory();

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const { createSite } = useDispatch( ONBOARD_STORE );
	const { setHasUsedPlansStep } = useDispatch( ONBOARD_STORE );
	const plan = useSelectedPlan();
	const shouldSiteBePublic = useShouldSiteBePublicOnSelectedPlan();

	const freeDomainSuggestion = useFreeDomainSuggestion();

	useEffect( () => {
		setHasUsedPlansStep( true );
	}, [] );

	// Keep a copy of the selected plan locally so it's available when the component is unmounting
	const selectedPlanRef = useRef< string | undefined >();
	useEffect( () => {
		selectedPlanRef.current = plan?.storeSlug;
	}, [ plan ] );

	useTrackStep( 'Plans', () => ( {
		selected_plan: selectedPlanRef.current,
		from_plans_button: !! isModal,
	} ) );

	const handleBack = () => ( isModal ? history.goBack() : history.push( makePath( Step.Style ) ) );
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
			<ActionButtons
				secondaryButton={
					<Button className="plans__back-link" isLink onClick={ handleBack }>
						{ __( 'Go back' ) }
					</Button>
				}
			/>
		</>
	);

	return (
		<div className="gutenboarding-page plans">
			<PlansGrid header={ header } onPlanSelect={ handlePlanSelect } />
			{ showSignupDialog && <SignupForm onRequestClose={ () => setShowSignupDialog( false ) } /> }
		</div>
	);
}
