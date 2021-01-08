/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Plans } from '@automattic/data-stores';
import PlansGrid from '@automattic/plans-grid';
import { Title, SubTitle } from '@automattic/onboarding';
import { useHistory } from 'react-router-dom';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../../stores';
import GoBackButton from '../go-back-button';

import './style.scss';

const PlanDetails: React.FunctionComponent = () => {
	const locale = useLocale();
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const selectedPlan = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedPlan() );
	const history = useHistory();

	const { updatePlan } = useDispatch( LAUNCH_STORE );

	const hasPaidDomain = domain && ! domain.is_free;

	const goBack = () => {
		history.goBack();
	};

	const handleSelect = ( planSlug: Plans.PlanSlug ) => {
		updatePlan( planSlug );
		goBack();
	};

	return (
		<div className="focused-launch-container focused-launch-container--wide">
			<div className="focused-launch-details__back-button-wrapper">
				<GoBackButton onClick={ goBack } />
			</div>
			<div className="focused-launch-details__header">
				<Title tagName="h2">{ __( 'Select a plan', __i18n_text_domain__ ) }</Title>
				<SubTitle tagName="h3">
					{ __(
						"There's no risk, you can cancel for a full refund within 30 days.",
						__i18n_text_domain__
					) }
				</SubTitle>
			</div>
			<div className="focused-launch-details__body">
				<PlansGrid
					currentDomain={ domain }
					onPlanSelect={ handleSelect }
					currentPlan={ selectedPlan }
					onPickDomainClick={ goBack }
					customTagLines={ {
						free_plan: __( 'Best for getting started', __i18n_text_domain__ ),
						'business-bundle': __( 'Best for small businesses', __i18n_text_domain__ ),
					} }
					showPlanTaglines
					popularBadgeVariation="NEXT_TO_NAME"
					disabledPlans={
						hasPaidDomain
							? {
									[ Plans.PLAN_FREE ]: __(
										'Not available with custom domain',
										__i18n_text_domain__
									),
							  }
							: undefined
					}
					CTAVariation="FULL_WIDTH"
					locale={ locale }
					hidePlansComparison
					defaultAllPlansExpanded
				/>
			</div>
		</div>
	);
};

export default PlanDetails;
