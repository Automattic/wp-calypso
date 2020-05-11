/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PlansGrid from '../../components/plans/plans-grid';
import SignupForm from '../../components/signup-form';
import useSelectedPlan from '../../hooks/use-selected-plan';
import { useTrackStep } from '../../hooks/use-track-step';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import { STORE_KEY as PLANS_STORE } from '../../stores/plans';
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

export default function PlansStep() {
	const { __ } = useI18n();

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );

	const { createSite } = useDispatch( ONBOARD_STORE );

	const { setPlan } = useDispatch( PLANS_STORE );
	const plan = useSelectedPlan();

	const freeDomainSuggestion = useFreeDomainSuggestion();

	useTrackStep( 'Plans', () => ( {
		selected_plan: plan.getStoreSlug(),
	} ) );

	const handleCreateSite = ( username: string, bearerToken?: string ) => {
		createSite( username, freeDomainSuggestion, bearerToken, plan.getStoreSlug() );
	};

	return (
		<div>
			<PlansGrid
				renderConfirmButton={ () => (
					<Button
						isPrimary
						onClick={ () => {
							currentUser ? handleCreateSite( currentUser.username ) : setShowSignupDialog( true );
						} }
					>
						{ __( 'Continue' ) }
					</Button>
				) }
				onPlanChange={ setPlan }
				selectedPlanSlug={ plan.getStoreSlug() }
			/>
			{ showSignupDialog && <SignupForm onRequestClose={ () => setShowSignupDialog( false ) } /> }
		</div>
	);
}
