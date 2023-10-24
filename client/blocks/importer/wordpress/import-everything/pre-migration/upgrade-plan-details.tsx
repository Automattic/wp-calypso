import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, PLAN_BUSINESS, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { check, plus, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useState, useEffect } from 'react';
import QueryPlans from 'calypso/components/data/query-plans';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import PlanPrice from 'calypso/my-sites/plan-price';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import type { SiteDetails } from '@automattic/data-stores';

interface Props {
	sourceSiteSlug: string;
	targetSite: SiteDetails | null;
}

export const UpgradePlanDetails = ( props: Props ) => {
	const { __ } = useI18n();
	const initialFeaturesNumber = 6;

	const { targetSite } = props;
	const targetSiteEligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, targetSite?.ID )
	);
	const planType = targetSiteEligibleForProPlan ? PLAN_WPCOM_PRO : PLAN_BUSINESS;
	const plan = getPlan( planType );
	const planId = plan?.getProductId();
	const [ visibleFeaturesNum, setVisibleFeatureNum ] = useState( initialFeaturesNumber );

	const features =
		plan && 'getPlanCompareFeatures' in plan
			? ( plan?.getPlanCompareFeatures?.() || [] )
					.map( ( feature: string ) => getFeatureByKey( feature )?.getTitle() )
					.filter( ( x ) => x )
			: [];

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

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_migration_plan_display' );
	}, [] );

	return (
		<div className={ classnames( 'import__upgrade-plan' ) }>
			<QueryPlans />

			<div className={ classnames( 'import__upgrade-plan-container' ) }>
				<div className={ classnames( 'import__upgrade-plan-price' ) }>
					<h3 className={ classnames( 'plan-title' ) }>{ plan?.getTitle() }</h3>
					<PlanPrice rawPrice={ rawPrice ?? undefined } currencyCode={ currencyCode } />
					<span className={ classnames( 'plan-time-frame' ) }>{ plan?.getBillingTimeFrame() }</span>
				</div>
				<div className={ classnames( 'import__upgrade-plan-details' ) }>
					{ renderFeatureList() }
				</div>
			</div>
		</div>
	);
};

export default UpgradePlanDetails;
