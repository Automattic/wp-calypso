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
import { Link } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { Route } from '../route';
import { LAUNCH_STORE } from '../../stores';
import { useSite } from '../../hooks';

import './style.scss';

const PlanDetails: React.FunctionComponent = () => {
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );

	const { updatePlan, setStep } = useDispatch( LAUNCH_STORE );

	const { selectedFeatures } = useSite();

	const hasPaidDomain = domain && ! domain.is_free;

	const handleSelect = ( planSlug: Plans.PlanSlug ) => {
		updatePlan( planSlug );
	};

	const handlePickDomain = () => {
		setStep( LaunchStep.Domain );
	};

	return (
		<div>
			<Link to={ Route.Summary }>{ __( 'Go back', __i18n_text_domain__ ) }</Link>
			<div className="focused-launch-plan-details__header">
				<div>
					<Title>{ __( 'Select a plan', __i18n_text_domain__ ) }</Title>
					<SubTitle>
						{ __(
							'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.',
							__i18n_text_domain__
						) }
					</SubTitle>
				</div>
			</div>
			<div className="focused-launch-plan-details__body">
				<PlansGrid
					currentDomain={ domain }
					onPlanSelect={ handleSelect }
					onPickDomainClick={ handlePickDomain }
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
					selectedFeatures={ selectedFeatures }
				/>
			</div>
		</div>
	);
};

export default PlanDetails;
