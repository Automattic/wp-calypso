/**
 * External dependencies
 */
import classNames from 'classnames';
import { translate as globalTranslate, useTranslate, TranslateResult } from 'i18n-calypso';
import { isFinite } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gridicon from 'components/gridicon';
import { preventWidows } from 'lib/formatting';
import PlanPrice from 'my-sites/plan-price';

/**
 * Style dependencies
 */
type OwnProps = {
	billingTimeFrame: TranslateResult;
	className?: string;
	currencyCode: string;
	description?: TranslatedResult;
	discountedPrice?: number;
	features?: TranslatedResult[];
	onCancelClick: () => void;
	onUpgradeClick: () => void;
	originalPrice: number;
};

const DEFAULT_DESCRIPTION = globalTranslate(
	'Additional security for sites with 24/7 activity.' +
		' Recommended for eCommerce stores, news organizations, and online forums.'
);

const DEFAULT_FEATURES = [
	{
		title: globalTranslate( 'Real-Time Backup' ),
		subtitle: globalTranslate( 'Every edit gets saved immediatelly' ),
	},
	{
		title: globalTranslate( 'Real-Time Scan' ),
		subtitle: globalTranslate( 'On-demand scanning' ),
	},
];

const UpgradeNudge = ( {
	billingTimeFrame,
	className,
	currencyCode,
	description = DEFAULT_DESCRIPTION,
	discountedPrice,
	features = DEFAULT_FEATURES,
	onCancelClick,
	onUpgradeClick,
	originalPrice,
}: OwnProps ) => {
	const translate = useTranslate();
	const isDiscounted = isFinite( discountedPrice );
	return (
		<div className={ classNames( 'jetpack-product-card__nudge', className ) }>
			<div className="jetpack-product-card__summary">
				<div className="jetpack-product-card__nudge-heading">
					<h3>{ translate( 'Upgrade to' ) }</h3>
					<h2 className="jetpack-product-card__nudge-product-type">{ translate( 'Real-Time' ) }</h2>
				</div>
				<div className="jetpack-product-card__price">
					<span className="jetpack-product-card__raw-price">
						<PlanPrice
							rawPrice={ originalPrice }
							original={ isDiscounted }
							currencyCode={ currencyCode }
						/>
						{ isDiscounted && (
							<PlanPrice rawPrice={ discountedPrice } discounted currencyCode={ currencyCode } />
						) }
					</span>
					<span className="jetpack-product-card__billing-time-frame">{ billingTimeFrame }</span>
				</div>
			</div>
			<p className="jetpack-product-card__nudge-description">{ preventWidows( description ) }</p>

			<Button className="jetpack-product-card__nudge-button" primary onClick={ onUpgradeClick }>
				{ translate( 'Upgrade' ) }
			</Button>

			<ul className="jetpack-product-card__nudge-features">
				{ features.map( ( { subtitle, title } ) => (
					<li className="jetpack-product-card__nudge-feature" key={ title }>
						<Gridicon icon="checkmark" />
						<div className="jetpack-product-card__nudge-feature-desc">
							<strong>{ title }</strong>
							<br />
							{ subtitle }
						</div>
					</li>
				) ) }
			</ul>

			<Button
				className="jetpack-product-card__nudge-button jetpack-product-card__nudge-button--cancel"
				borderless
				onClick={ onCancelClick }
			>
				{ translate( 'No thanks' ) }
			</Button>
		</div>
	);
};

export default UpgradeNudge;
