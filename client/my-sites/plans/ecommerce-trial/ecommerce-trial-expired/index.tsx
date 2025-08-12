import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useMemo, useState } from 'react';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { WooExpressPlans } from 'calypso/my-sites/plans/ecommerce-trial/wooexpress-plans';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';
import useOneDollarOfferTrack from '../../hooks/use-onedollar-offer-track';
import { EntrepreneurPlan } from '../entrepreneur-plan/entrepreneur-plan';

const ECommerceTrialExpired = (): JSX.Element => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID ?? null;
	const siteSlug = selectedSite?.slug ?? null;
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const siteIsAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const purchase = useSelector( getSelectedPurchase );

	const nonECommerceTrialPurchases = useMemo(
		() =>
			sitePurchases.filter( ( purchase ) => purchase.productSlug !== PLAN_ECOMMERCE_TRIAL_MONTHLY ),
		[ sitePurchases ]
	);

	useOneDollarOfferTrack( siteId, 'trialexpired' );

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

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_wooexpress_expired_trial_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	// Note that the Calypso URL always works, so we only want the wp-admin URL when we have the site's URL.
	const exportUrl =
		siteIsAtomic && selectedSite?.URL
			? `${ selectedSite.URL }/wp-admin/export.php`
			: `/export/${ siteSlug }`;
	const settingsDeleteSiteUrl = `/settings/delete-site/${ siteSlug }?options=noCrumbs`;

	const onDeleteClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.preventDefault();

			recordTracksEvent( 'calypso_plan_trial_expired_page_delete_site', {
				site_slug: siteSlug,
				trial_type: 'ecommerce',
			} );
			page.redirect( settingsDeleteSiteUrl );
		},
		[ page, recordTracksEvent, settingsDeleteSiteUrl ]
	);

	const isWooExpressTrial = purchase?.isWooExpressTrial;
	const isEntrepreneurTrial = ! purchase?.isWooExpressTrial;

	return (
		<>
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			{ siteId && <QuerySitePlans siteId={ siteId } /> }

			<BodySectionCssClass bodyClass={ [ 'is-expired-ecommerce-trial-plan' ] } />
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
									' ' +
									'Unlock more features, launch and start selling, and make your business venture a reality.'
							) }
						</div>
						{ nonECommerceTrialPurchases && nonECommerceTrialPurchases.length > 0 && (
							<div className="ecommerce-trial-expired__manage-purchases">
								<a href={ `/purchases/subscriptions/${ siteSlug }` }>
									{ translate( 'Manage your previous purchases' ) }
								</a>
							</div>
						) }
					</div>
				</div>
				{ isWooExpressTrial && (
					<WooExpressPlans
						interval={ interval }
						monthlyControlProps={ monthlyControlProps }
						siteId={ siteId ?? 0 }
						siteSlug={ siteSlug ?? '' }
						triggerTracksEvent={ triggerPlansGridTracksEvent }
						yearlyControlProps={ yearlyControlProps }
						showIntervalToggle
					/>
				) }
				{ isEntrepreneurTrial && <EntrepreneurPlan hideTrialIncluded /> }
				{ ! isWooExpressTrial && ! isEntrepreneurTrial && (
					<Spinner className="ecommerce-trial-expired__spinner" />
				) }

				<div className="ecommerce-trial-expired__footer">
					<Button href={ exportUrl }>
						<Gridicon icon="cloud-download" />
						<span>{ translate( 'Export your content' ) }</span>
					</Button>
					<Button href={ settingsDeleteSiteUrl } onClick={ onDeleteClick } scary>
						<Gridicon icon="trash" />
						<span>{ translate( 'Delete your site permanently' ) }</span>
					</Button>
				</div>
			</Main>
		</>
	);
};

export default ECommerceTrialExpired;
