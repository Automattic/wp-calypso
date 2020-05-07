/**
 * External dependencies
 */
import * as React from 'react';
import { Button, Icon } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */

import { Plan } from '../../../lib/plans';
import { Title, SubTitle } from '../../titles';
import ActionButtons from '../../action-buttons';
import PlansTable from '../plans-table';
import PlansDetails from '../plans-details';

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
	const [ showDetails, setShowDetails ] = React.useState( false );

	const handlePlanSelect = ( plan: Plan ) => {
		setSelectedPlan( plan );
		onPlanChange( plan );
	};

	const handleDetailsToggleButtonClick = () => {
		setShowDetails( ! showDetails );
	};

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
				<ActionButtons
					primaryButton={ renderConfirmButton( selectedPlan ) }
					secondaryButton={ cancelButton }
				/>
			</div>

			<div className="plans-grid__table">
				<PlansTable selectedPlan={ selectedPlan } onPlanSelect={ handlePlanSelect }></PlansTable>
			</div>

			<div className="plans-grid__details">
				{ showDetails && (
					<div className="plans-grid__details-heading">
						<Title>{ __( 'Detailed comparison' ) }</Title>
						<PlansDetails />
					</div>
				) }
				<Button
					className="plans-grid__details-toggle-button"
					isLarge
					onClick={ handleDetailsToggleButtonClick }
				>
					{ showDetails ? (
						<>
							<span>{ __( 'Less details' ) } </span>
							<Icon icon="arrow-up" size={ 20 }></Icon>
						</>
					) : (
						<>
							<span>{ __( 'More details' ) } </span>
							<Icon icon="arrow-down" size={ 20 }></Icon>
						</>
					) }
				</Button>
			</div>
		</div>
	);
};

export default PlansGrid;
