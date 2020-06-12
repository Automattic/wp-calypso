/**
 * External dependencies
 */
import * as React from 'react';
import classNames from 'classnames';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { Plans, DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { Title } from '../titles';
import PlansTable from '../plans-table';
import PlansDetails from '../plans-details';

/**
 * Style dependencies
 */
import './style.scss';

const PLANS_STORE = Plans.register();
type PlansSlug = Plans.PlanSlug;

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#Mobile_Tablet_or_Desktop
const isMobile = window.navigator.userAgent.indexOf( 'Mobi' ) > -1;

export interface Props {
	header: React.ReactElement;
	currentPlan?: Plans.Plan;
	onPlanSelect?: () => void;
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

	const [ showDetails, setShowDetails ] = React.useState( false );

	const handleDetailsToggleButtonClick = () => {
		setShowDetails( ( show ) => ! show );
	};

	const handlePlanSelect = ( plan: PlansSlug ) => {
		setPlan( plan );
		onPlanSelect?.();
	};

	return (
		<div
			className={ classNames( 'plans-grid', {
				'is-mobile': isMobile,
				'show-details': showDetails,
			} ) }
		>
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
					<PlansDetails>
						<div className="plans-grid__details-actions">
							<Button
								className={ classNames( 'plans-grid__details-toggle-button', {
									'is-collapsed': ! showDetails,
								} ) }
								isLarge
								onClick={ handleDetailsToggleButtonClick }
							>
								<span>{ showDetails ? __( 'Hide details' ) : __( 'Show details' ) }</span>
								<Icon icon={ chevronDown } size={ 20 } />
							</Button>
						</div>
					</PlansDetails>
				</div>
			</div>
		</div>
	);
};

export default PlansGrid;
