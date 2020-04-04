/*
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Button, Modal, Dashicon } from '@wordpress/components';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import PlanPrices from './plan-prices.json';
import PlanBlock from './plan-block';
import { STORE_KEY } from '../../stores/onboard';
import { PLANS_LIST } from 'lib/plans/plans-list';
import { getFeatureByKey } from 'lib/plans/features-list';
/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props {
	onCancel: () => void;
	onAccept: () => void;
	selectedDomain: DomainSuggestion;
}
const PlansGrid: FunctionComponent< Props > = props => {
	const { __: NO__ } = useI18n();
	const isLoggedIn = useSelect( select => select( USER_STORE ).isCurrentUserLoggedIn() );
	const { selectedDesign, selectedFonts } = useSelect( select => select( STORE_KEY ).getState() );

	const plans = [
		PLANS_LIST[ 'personal-bundle' ],
		PLANS_LIST[ 'value_bundle' ],
		PLANS_LIST[ 'business-bundle' ],
		PLANS_LIST[ 'ecommerce-bundle' ],
	];

	const popularPlan = 'value_bundle';

	const allFeatures = PLANS_LIST[ 'ecommerce-bundle' ].getPlanCompareFeatures();

	const planFeaturesHeader = () => {
		return (
			<div className="plans-grid__plans-features">
				{ allFeatures.map( feature => {
					const featObject = getFeatureByKey( feature );
					return (
						<div className="plans-grid__plans-feature" key={ feature }>
							{ featObject.getTitle() }
						</div>
					);
				} ) }
			</div>
		);
	};

	const planHeaderOption = ( icon, title, value ) => {
		return (
			<div className="plans-grid__plans-header-option">
				<div className="plans-grid__plans-option-icon">
					<Dashicon icon={ icon } />
				</div>
				<div className="plans-grid__plans-option-title">{ title }</div>
				<div className="plans-grid__plans-option-value">{ value }</div>
			</div>
		);
	};

	const planHeaders = function( selectedDomain ) {
		return (
			<div className="plans-grid__plans-header plan-block">
				<div className="plan-block__plan-info">
					<div className="plan-block__plan-name">{ NO__( 'All paid plans include:' ) }</div>
					<div className="plans-grid__plans-header-options">
						{ planHeaderOption( 'admin-site-alt3', NO__( 'Domain' ), selectedDomain.domain_name ) }
						{ selectedDesign &&
							planHeaderOption( 'screenoptions', NO__( 'Layout' ), selectedDesign.title ) }
						{ selectedFonts &&
							planHeaderOption(
								'admin-customizer',
								NO__( 'Fonts' ),
								selectedFonts.headings + ' / ' + selectedFonts.base
							) }
					</div>
				</div>
				{ planFeaturesHeader() }
			</div>
		);
	};

	return (
		<Modal
			title={ NO__( 'Choose a Plan' ) }
			className="plans-grid"
			isDismissible={ false }
			onRequestClose={ props.onCancel }
		>
			<div className="plans-grid__header">{ NO__( 'Choose a Plan' ) }</div>
			<div className="plans-grid__subtitle">
				{ NO__( "Pick a plan that's right for you. Swicht plans as your needs change." ) }
				<br />
				{ NO__( "There's no risk, you can cancel for a full refund within 30 days" ) }
			</div>
			<div className="plans-grid__grid">
				{ planHeaders( props.selectedDomain ) }
				{ plans.map( plan => {
					return (
						<PlanBlock
							plan={ plan }
							price={ PlanPrices[ plan.getStoreSlug() ] }
							allFeatures={ allFeatures }
							popular={ plan.getStoreSlug() === popularPlan }
							key={ plan.getTitle() }
							onSelect={ () => props.selectPlan( plan ) }
						/>
					);
				} ) }
			</div>
			<div className="plans-grid__buttons">
				<Button isLarge onClick={ props.onCancel }>
					{ NO__( 'Do it later' ) }
				</Button>
				<Button isLarge isPrimary onClick={ props.onAccept }>
					{ NO__( 'Create your site and register your new domain' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default PlansGrid;
