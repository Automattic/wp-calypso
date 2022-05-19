import { getPlan, PLAN_BUSINESS, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { sprintf } from '@wordpress/i18n';
import { check, plus, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import PlanPrice from 'calypso/my-sites/plan-price';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import type { FunctionComponent } from 'react';

interface Props {
	sourceSite: SitesItem | null;
	targetSite: SitesItem | null;
}

export const ConfirmUpgradePlan: FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const initialFeaturesNumber = 6;

	const { sourceSite, targetSite } = props;
	const targetSiteEligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, targetSite?.ID )
	);
	const planType = targetSiteEligibleForProPlan ? PLAN_WPCOM_PRO : PLAN_BUSINESS;
	const plan = getPlan( planType );
	const planId = plan?.getProductId();
	const [ visibleFeaturesNum, setVisibleFeatureNum ] = useState( initialFeaturesNumber );

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	let features: string[] = plan?.getPlanCompareFeatures() ?? [];
	features = features
		.map( ( x: string ) => getFeatureByKey( x )?.getTitle() || '' )
		.filter( ( x: string ) => x );

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const rawPrice = useSelector( ( state ) => getPlanRawPrice( state, planId as number, true ) );

	function renderFeatureList() {
		return (
			<ul className={ classnames( 'import__details-list' ) }>
				{ features.slice( 0, visibleFeaturesNum ).map( ( feature, i ) => (
					<li className={ classnames( 'import__upgrade-plan-feature' ) } key={ i }>
						<Icon size={ 20 } icon={ check } />
						<span>{ feature }</span>
					</li>
				) ) }
				{ visibleFeaturesNum < features.length && (
					<li className={ classnames( 'import__upgrade-plan-feature-more' ) }>
						<button onClick={ () => setVisibleFeatureNum( features.length ) }>
							<Icon size={ 20 } icon={ plus } /> { __( 'See more' ) }
						</button>
					</li>
				) }
			</ul>
		);
	}

	return (
		<div className={ classnames( 'import__upgrade-plan' ) }>
			<QueryPlans />
			<p>
				{ sprintf(
					/* translators: the website could be any domain (eg: "yourname.com") */
					__(
						'To import your themes, plugins, users, and settings from %(website)s we need to upgrade your WordPress.com site. Select a plan below:'
					),
					{ website: sourceSite?.slug }
				) }
			</p>

			<div className={ classnames( 'import__upgrade-plan-container' ) }>
				<div className={ classnames( 'import__upgrade-plan-price' ) }>
					<h3 className={ classnames( 'plan-title' ) }>{ plan?.getTitle() }</h3>
					<PlanPrice rawPrice={ rawPrice } currencyCode={ currencyCode } />
					<span className={ classnames( 'plan-time-frame' ) }>{ plan?.getBillingTimeFrame() }</span>
				</div>
				<div className={ classnames( 'import__upgrade-plan-details' ) }>
					{ renderFeatureList() }
				</div>
			</div>
		</div>
	);
};

export default ConfirmUpgradePlan;
