/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import type { Plans, DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { Title } from '../titles';
import PlansTable from '../plans-table';
import PlansDetails from '../plans-details';
import { PLANS_STORE } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';
type PlansSlug = Plans.PlanSlug;

export interface Props {
	header: React.ReactElement;
	currentPlan?: Plans.Plan;
	onPlanSelect?: ( plan: PlansSlug ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
}

const PlansGrid: React.FunctionComponent< Props > = ( {
	header,
	currentPlan,
	currentDomain,
	onPlanSelect,
	onPickDomainClick,
} ) => {
	const { __ } = useI18n();

	const { setPlan } = useDispatch( PLANS_STORE );

	const handlePlanSelect = ( plan: PlansSlug ) => {
		setPlan( plan );
		onPlanSelect?.( plan );
	};

	return (
		<div className="plans-grid">
			<div className="plans-grid__header">{ header }</div>
			<div className="plans-grid__table">
				<div className="plans-grid__table-container">
					<PlansTable
						selectedPlanSlug={ currentPlan?.storeSlug ?? '' }
						onPlanSelect={ handlePlanSelect }
						currentDomain={ currentDomain }
						onPickDomainClick={ onPickDomainClick }
					></PlansTable>
				</div>
			</div>

			<div className="plans-grid__details">
				<div className="plans-grid__details-heading">
					<Title>{ __( 'Detailed comparison' ) }</Title>
				</div>
				<div className="plans-grid__details-container">
					<PlansDetails onSelect={ handlePlanSelect } />
				</div>
			</div>
		</div>
	);
};

export default PlansGrid;
