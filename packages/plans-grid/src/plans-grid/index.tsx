/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import type { Plans, DomainSuggestions } from '@automattic/data-stores';
import { Title } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import PlansTable from '../plans-table';
import PlansDetails from '../plans-details';

/**
 * Style dependencies
 */
import './style.scss';

type PlansSlug = Plans.PlanSlug;

export interface Props {
	header?: React.ReactElement;
	currentPlan?: Plans.Plan;
	onPlanSelect: ( plan: PlansSlug ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: { [ planSlug: string ]: string };
	singleColumn?: boolean;
}

const PlansGrid: React.FunctionComponent< Props > = ( {
	header,
	currentPlan,
	currentDomain,
	onPlanSelect,
	onPickDomainClick,
	disabledPlans,
	singleColumn,
} ) => {
	const { __ } = useI18n();

	// Note: singleColumn prop would be always false until "gutenboarding/feature-picker" feature flag is enabled
	// and Gutenboarding flow is started with ?latest query param
	singleColumn && console.log( 'display accordion' ); // eslint-disable-line no-console

	return (
		<div className="plans-grid">
			{ header && <div className="plans-grid__header">{ header }</div> }

			<div className="plans-grid__table">
				<div className="plans-grid__table-container">
					<PlansTable
						selectedPlanSlug={ currentPlan?.storeSlug ?? '' }
						onPlanSelect={ onPlanSelect }
						currentDomain={ currentDomain }
						onPickDomainClick={ onPickDomainClick }
						disabledPlans={ disabledPlans }
					></PlansTable>
				</div>
			</div>

			<div className="plans-grid__details">
				<div className="plans-grid__details-heading">
					<Title>{ __( 'Detailed comparison' ) }</Title>
				</div>
				<div className="plans-grid__details-container">
					<PlansDetails onSelect={ onPlanSelect } />
				</div>
			</div>
		</div>
	);
};

export default PlansGrid;
