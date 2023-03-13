import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import ECommercePlanFeatures from 'calypso/my-sites/plans/components/ecommerce-plan-features';
import { getExpiredTrialWooExpressMediumFeatureSets } from 'calypso/my-sites/plans/ecommerce-trial/wx-medium-features';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const ECommerceTrialExpired = (): JSX.Element => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const [ interval, setInterval ] = useState( 'monthly' as 'monthly' | 'yearly' );

	const { monthlyControlProps, yearlyControlProps } = useMemo( () => {
		return {
			monthlyControlProps: {
				onClick: () => setInterval( 'monthly' ),
			},
			yearlyControlProps: {
				onClick: () => setInterval( 'yearly' ),
			},
		};
	}, [ setInterval ] );

	const expiredTrialWooExpressMediumPlanFeatureSets = useMemo( () => {
		return getExpiredTrialWooExpressMediumFeatureSets( { translate } );
	}, [ translate ] );

	const triggerTracksEvent = useCallback( ( tracksLocation: string ) => {
		recordTracksEvent( 'calypso_wooexpress_expired_trial_upgrade_cta_clicked', {
			location: tracksLocation,
		} );
	}, [] );

	return (
		<>
			<QueryPlans />
			<BodySectionCssClass bodyClass={ [ 'is-ecommerce-trial-plan' ] } />
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-expired/:site"
					title="Plans > Ecommerce Trial Expired"
				/>
				<div className="ecommerce-trial-expired__content">
					<div className="ecommerce-trial-expired__header">
						<h1 className="ecommerce-trial-expired__title">
							{ translate( 'Your free trial has ended' ) }
						</h1>
						<div className="ecommerce-trial-expired__subtitle">
							{ translate(
								'Don’t lose all that hard work! Upgrade to a paid plan to continue working on your store.' +
									'Unlock more features, launch and start selling, and make your business venture a reality.'
							) }
						</div>
					</div>
				</div>

				<ECommercePlanFeatures
					interval={ interval }
					monthlyControlProps={ monthlyControlProps }
					planFeatureSets={ expiredTrialWooExpressMediumPlanFeatureSets }
					priceCardSubtitle={ translate(
						'Kickstart your growth with the world’s most-trusted ecommerce platform.'
					) }
					siteSlug={ siteSlug }
					triggerTracksEvent={ triggerTracksEvent }
					yearlyControlProps={ yearlyControlProps }
				/>
			</Main>
		</>
	);
};

export default ECommerceTrialExpired;
