/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
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
	const selectedPlanProductId = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getSelectedPlanProductId()
	);

	const history = useHistory();

	const { updatePlan } = useDispatch( LAUNCH_STORE );

	const hasPaidDomain = domain && ! domain.is_free;

	const goBack = () => {
		history.goBack();
	};
	const handleSelect = ( planProductId: number | undefined ) => {
		updatePlan( planProductId );
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
					{ sprintf(
						/* translators: number of days */
						__(
							"There's no risk, you can cancel for a full refund within %1$d days.",
							__i18n_text_domain__
						),
						14
					) }
				</SubTitle>
			</div>
			<div className="focused-launch-details__body">
				<PlansGrid
					currentDomain={ domain }
					onPlanSelect={ handleSelect }
					currentPlanProductId={ selectedPlanProductId }
					onPickDomainClick={ goBack }
					customTagLines={ {
						Free: __( 'Best for getting started', __i18n_text_domain__ ) as string,
						Business: __( 'Best for small businesses', __i18n_text_domain__ ) as string,
					} }
					showPlanTaglines
					popularBadgeVariation="NEXT_TO_NAME"
					disabledPlans={
						hasPaidDomain
							? {
									[ 'Free' ]: __( 'Unavailable with domain', __i18n_text_domain__ ),
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
