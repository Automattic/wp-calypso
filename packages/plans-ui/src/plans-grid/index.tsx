/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { Plans } from '@automattic/data-stores';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Title, SubTitle } from '../titles';
import ActionButtons from '../action-buttons';
import PlansTable from '../plans-table';
import PlansDetails from '../plans-details';

/**
 * Style dependencies
 */
import './style.scss';

const PLANS_STORE = Plans.register();

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#Mobile_Tablet_or_Desktop
const isMobile = window.navigator.userAgent.indexOf( 'Mobi' ) > -1;

export interface Props {
	confirmButton: React.ReactElement;
	cancelButton?: React.ReactElement;
	currentPlan: Plans.Plan;
}

const PlansGrid: React.FunctionComponent< Props > = ( {
	confirmButton,
	cancelButton,
	currentPlan,
} ) => {
	const { __ } = useI18n();

	const { setPlan } = useDispatch( PLANS_STORE );

	const [ showDetails, setShowDetails ] = React.useState( false );

	const handleDetailsToggleButtonClick = () => {
		setShowDetails( ( show ) => ! show );
	};

	return (
		<div
			className={ classNames( 'plans-grid', {
				'is-mobile': isMobile,
				'show-details': showDetails,
			} ) }
		>
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
				<div className="plans-grid__table-container">
					<PlansTable
						selectedPlanSlug={ currentPlan?.storeSlug ?? '' }
						onPlanSelect={ setPlan }
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
