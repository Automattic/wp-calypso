/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */

import { Plan, supportedPlans, getPlanTitle } from '../../../lib/plans';
import { Title, SubTitle } from '../../titles';
import ActionButtons from '../../action-buttons';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	currentPlan: Plan;
	renderConfirmButton: ( plan: Plan ) => React.ReactElement;
	cancelButton?: React.ReactElement;
	onPlanChange?: ( plan: Plan ) => void;
}

const PlansGrid: React.FunctionComponent< Props > = ( {
	currentPlan,
	renderConfirmButton,
	cancelButton,
	onPlanChange = () => undefined,
} ) => {
	const { __ } = useI18n();
	const [ selectedPlan, setSelectedPlan ] = React.useState< Plan >( currentPlan );

	const handlePlanSelect = ( plan: Plan ) => {
		setSelectedPlan( plan );
		onPlanChange( plan );
	};

	return (
		<div className="plans-grid">
			<div className="plans-grid__header">
				<Title>{ __( 'Choose a plan' ) }</Title>
				<SubTitle>
					{ __(
						'Pick a plan that’s right for you. Switch plans as your needs change. There’s no risk, you can cancel for a full refund within 30 days.'
					) }
				</SubTitle>
				<ActionButtons
					primaryButton={ renderConfirmButton( selectedPlan ) }
					secondaryButton={ cancelButton }
				/>
			</div>

			{ /* @TODO: Replace with real grid */ }
			<div className="plans-grid__table">
				{ supportedPlans.map( ( plan, index ) => (
					<div key={ index } className="plans-grid__column">
						{ getPlanTitle( plan ) }
						<Button
							isPrimary
							className={ selectedPlan === plan ? 'plans-grid__button--active' : '' }
							onClick={ () => handlePlanSelect( plan ) }
						>
							Select { getPlanTitle( plan ) }
						</Button>
					</div>
				) ) }
			</div>
		</div>
	);
};

export default PlansGrid;
