/*
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { Button, Modal, Dashicon } from '@wordpress/components';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';

const PlanBlock: FunctionComponent< Props > = props => {
	const { __: NO__ } = useI18n();
	const plan = props.plan;
	const price = props.price;
	const allFeatures = props.allFeatures;
	const planFeatures = plan.getPlanCompareFeatures();

	const getPopularRibbon = () => {
		if ( props.popular ) {
			return <div className="plan-block__popular-ribbon">{ NO__( 'Popular' ) }</div>;
		}
		return null;
	};

	return (
		<div className={ classNames( 'plan-block', { 'plan-block__popular': props.popular } ) }>
			<div className="plan-block__plan-info">
				{ getPopularRibbon() }
				<div className="plan-block__plan-name">{ plan.getTitle() }</div>
				<div className="plan-block__plan-motto">{ plan.getAudience() }</div>
				<div className="plan-block__plan-price">
					<span className="plan-block__plan-price-currency"> { price.currency }</span>
					<span className="plan-block__plan-price-price"> { price.price }</span>
					<div className="plan-block__plan-periodicity">
						{ NO__( 'per month, billed anually' ) }
					</div>
				</div>
				<div className="plan-block__select-plan">
					<Button onClick={ props.onSelect } isLarge>
						{ NO__( 'Get Started' ) }
					</Button>
				</div>
				<div className="plan-block__plan-description">{ plan.getShortDescription() }</div>
			</div>
			<div className="plan-block__plan-features">
				{ allFeatures.map( feature => {
					return (
						<div className="plans-block__plan-feature" key={ feature }>
							{ planFeatures.indexOf( feature ) >= 0 ? <Dashicon icon="yes" /> : null }
						</div>
					);
				} ) }
			</div>
		</div>
	);
};

export default PlanBlock;
