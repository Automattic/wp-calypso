/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import PlansGrid from '@automattic/plans-grid';

/**
 * Internal dependencies
 */
import SignupForm from '../../components/signup-form';
import Link from '../../components/link';
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
	} ) );

	const handleCreateSite = ( username: string, bearerToken?: string ) => {
		createSite( username, freeDomainSuggestion, bearerToken, shouldSiteBePublic );
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
				primaryButton={
					<Button
						isPrimary
						onClick={ () => {
							currentUser ? handleCreateSite( currentUser.username ) : setShowSignupDialog( true );
						} }
					>
						{ __( 'Continue' ) }
					</Button>
				}
				secondaryButton={
					<Link className="plans__back-link" isLink to={ makePath( Step.Style ) }>
						{ __( 'Go back' ) }
					</Link>
				}
			/>
		</>
	);

	return (
		<div className="gutenboarding-page plans">
			<PlansGrid header={ header } currentPlan={ plan } />
			{ showSignupDialog && <SignupForm onRequestClose={ () => setShowSignupDialog( false ) } /> }
		</div>
	);
}
