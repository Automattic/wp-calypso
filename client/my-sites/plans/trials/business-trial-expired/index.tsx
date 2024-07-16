import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useMemo } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import wasMigrationTrialSite from 'calypso/state/selectors/was-migration-trial-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';
import { BusinessTrialPlans } from '../business-trial-plans';

const BusinessTrialExpired = (): JSX.Element => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID ?? null;
	const siteSlug = selectedSite?.slug ?? null;
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const siteIsAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const siteIsMigration = useSelector( ( state ) => wasMigrationTrialSite( state, siteId ) );

	const nonBusinessTrialPurchases = useMemo(
		() =>
			sitePurchases.filter(
				( purchase ) =>
					! [ PLAN_HOSTING_TRIAL_MONTHLY, PLAN_MIGRATION_TRIAL_MONTHLY ].includes(
						purchase.productSlug
					)
			),
		[ sitePurchases ]
	);

	const triggerPlansGridTracksEvent = useCallback( ( planSlug: string ) => {
		recordTracksEvent( 'calypso_business_expired_trial_upgrade_cta_clicked', {
			location: 'plans_grid',
			plan_slug: planSlug,
		} );
	}, [] );

	// Note that the Calypso URL always works, so we only want the wp-admin URL when we have the site's URL.
	const exportUrl =
		siteIsAtomic && selectedSite?.URL
			? `${ selectedSite.URL }/wp-admin/export.php`
			: `/export/${ siteSlug }`;
	const settingsDeleteSiteUrl = `/settings/delete-site/${ siteSlug }`;

	const onDeleteClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.preventDefault();

			recordTracksEvent( 'calypso_plan_trial_expired_page_delete_site', {
				site_slug: siteSlug,
				trial_type: 'business',
			} );
			page.redirect( settingsDeleteSiteUrl );
		},
		[ page, recordTracksEvent, settingsDeleteSiteUrl ]
	);

	return (
		<>
			{ siteId && <QuerySitePurchases siteId={ siteId } /> }
			<BodySectionCssClass bodyClass={ [ 'is-expired-business-trial-plan' ] } />
			<Main wideLayout>
				<PageViewTracker
					path="/plans/my-plan/trial-expired/:site"
					title="Plans > Business Trial Expired"
				/>
				<div className="business-trial-expired__content">
					<div className="business-trial-expired__header">
						<h1 className="business-trial-expired__title">
							{ translate( 'Your free trial has ended' ) }
						</h1>
						<div className="business-trial-expired__subtitle">
							{ siteIsMigration
								? translate(
										'Don’t lose all that hard work! Upgrade to a paid plan to launch your migrated website, or {{a}}create a new site{{/a}}.',
										{
											components: {
												a: <a href="/start" />,
											},
										}
								  )
								: translate(
										'Don’t lose all that hard work! Upgrade to a paid plan or {{a}}create a new site{{/a}}.',
										{
											components: {
												a: <a href="/start" />,
											},
										}
								  ) }
						</div>
						{ nonBusinessTrialPurchases && nonBusinessTrialPurchases.length > 0 && (
							<div className="business-trial-expired__manage-purchases">
								<a href={ `/purchases/subscriptions/${ siteSlug }` }>
									{ translate( 'Manage your previous purchases' ) }
								</a>
							</div>
						) }
					</div>
				</div>
				<BusinessTrialPlans
					siteId={ siteId ?? 0 }
					siteSlug={ siteSlug ?? '' }
					triggerTracksEvent={ triggerPlansGridTracksEvent }
				/>

				<div className="business-trial-expired__footer">
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

export default BusinessTrialExpired;
