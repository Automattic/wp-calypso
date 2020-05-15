/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY as PLANS_STORE } from '../../../stores/plans';
import { Title, SubTitle } from '../../titles';
import ActionButtons from '../../action-buttons';
import PlansTable from '../plans-table';

/**
 * Style dependencies
 */
import './style.scss';
import { useSelectedPlan } from 'landing/gutenboarding/hooks/use-selected-plan';

export interface Props {
	confirmButton: React.ReactElement;
	cancelButton?: React.ReactElement;
}

const PlansGrid: React.FunctionComponent< Props > = ( { confirmButton, cancelButton } ) => {
	const { __ } = useI18n();

	const selectedPlan = useSelectedPlan();

	const { setPlan } = useDispatch( PLANS_STORE );

	return (
		<div className="plans-grid">
			<div className="plans-grid__header">
				<div>
					<Title>{ __( 'Choose a plan' ) }</Title>
					<SubTitle>
						{ __(
							'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.'
						) }
					</SubTitle>
				</div>
				<ActionButtons primaryButton={ confirmButton } secondaryButton={ cancelButton } />
			</div>

			<div className="plans-grid__table">
				<PlansTable
					selectedPlanSlug={ selectedPlan?.slug ?? '' }
					onPlanSelect={ setPlan }
				></PlansTable>
			</div>
		</div>
	);
};

export default PlansGrid;
