/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button, Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import { Title, SubTitle } from '../../components/titles';
import PlanItem from './plan-item';

const Plans: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="plans">
			<div className="plans__header">
				<div className="plans__heading">
					<Title>{ __( 'Choose a plan' ) }</Title>
					<SubTitle>
						{ __( "Pick a plan that's right for you. Switch plans as your needs change." ) }
					</SubTitle>
					<SubTitle>
						{ __( "There's no risk, you can cancel for a full refund within 30 days." ) }
					</SubTitle>
				</div>
				<div className="plans__actions">
					<Button className="plans__back-button" isLink>
						Back
					</Button>
					<Button className="plans__continue-button" isPrimary isLarge>
						{ __( 'Continue' ) }
					</Button>
				</div>
			</div>
			<div className="plans__body">
				<div className="plans__items">
					<PlanItem
						name="Free"
						price="$0"
						domainName="roastingbeans.wordpress.com"
						featureCount={ 1 }
					></PlanItem>
					<PlanItem name="Personal" price="$5" isSelected featureCount={ 4 }></PlanItem>
					<PlanItem name="Premium" price="$8" featureCount={ 9 }></PlanItem>
					<PlanItem name="Business" price="$25" featureCount={ 10 }></PlanItem>
					<PlanItem name="Commerce" price="$45" featureCount={ 11 }></PlanItem>
				</div>
				<Button className="plans__details-toggle-button" isLarge>
					<span>More details</span>
					<Icon icon="arrow-down" size={ 20 }></Icon>
				</Button>
			</div>
		</div>
	);
};

export default Plans;
