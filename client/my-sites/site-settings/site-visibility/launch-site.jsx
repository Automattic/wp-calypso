import { WPCOM_FEATURES_SITE_PREVIEW_LINKS } from '@automattic/calypso-products';
import { Card, CompactCard, Button } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import SitePreviewLink from 'calypso/components/site-preview-link';
import { useSelector, useDispatch } from 'calypso/state';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { launchSite } from 'calypso/state/sites/launch/actions';
import {
	isSiteOnECommerceTrial as getIsSiteOnECommerceTrial,
	isSiteOnMigrationTrial as getIsSiteOnMigrationTrial,
} from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import SettingsSectionHeader from '../settings-section-header';
import { LaunchSiteTrialUpsellNotice } from './launch-site-trial-notice';
import './styles.scss';

const LaunchSite = () => {
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSettings = useSelector( ( state ) => getSiteSettings( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const isPaidPlan = useSelector( ( state ) => isCurrentPlanPaid( state, siteId ) );
	const isComingSoon = useSelector( ( state ) => isSiteComingSoon( state, siteId ) );
	const hasSitePreviewLink = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SITE_PREVIEW_LINKS )
	);
	const isLaunchable = useSelector(
		( state ) =>
			! getIsSiteOnECommerceTrial( state, siteId ) && ! getIsSiteOnMigrationTrial( state, siteId )
	);
	const isUnlaunchedSite = useSelector( ( state ) => getIsUnlaunchedSite( state, siteId ) );

	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	const launchSiteClasses = clsx( 'site-settings__general-settings-launch-site-button', {
		'site-settings__disable-privacy-settings': ! siteDomains.length,
	} );
	const btnText = translate( 'Launch site' );
	const handleLaunchSite = () => {
		dispatch( launchSite( site.ID ) );
	};
	let querySiteDomainsComponent;
	let btnComponent;

	if ( 0 === siteDomains.length ) {
		querySiteDomainsComponent = <QuerySiteDomains siteId={ siteId } />;
		btnComponent = <Button>{ btnText }</Button>;
	} else if ( isPaidPlan && siteDomains.length > 1 ) {
		btnComponent = (
			<Button onClick={ handleLaunchSite } disabled={ ! isLaunchable }>
				{ btnText }
			</Button>
		);
		querySiteDomainsComponent = '';
	} else {
		btnComponent = (
			<Button
				href={ `/start/launch-site?siteSlug=${ siteSlug }&source=general-settings&new=${ site.title }&search=yes` }
			>
				{ btnText }
			</Button>
		);
		querySiteDomainsComponent = '';
	}

	const blogPublic = parseInt( siteSettings && siteSettings.blog_public, 10 );

	// isPrivateAndUnlaunched means it is an unlaunched coming soon v1 site
	const isPrivateAndUnlaunched = -1 === blogPublic && isUnlaunchedSite;

	const showPreviewLink = isComingSoon && hasSitePreviewLink;

	const LaunchCard = showPreviewLink ? CompactCard : Card;

	const isDevelopmentSite = site?.is_a4a_dev_site || false;

	const {
		data: agency,
		error: agencyError,
		isLoading: agencyLoading,
	} = useFetchAgencyFromBlog( site?.ID, { enabled: !! site?.ID && isDevelopmentSite } );
	const agencyName = agency?.name;

	const handleReferToClient = () => {
		window.location.href = `https://agencies.automattic.com/marketplace/checkout?referral_blog_id=${ siteId }`;
	};

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Launch site' ) } />
			<LaunchCard>
				<LaunchSiteTrialUpsellNotice />
				<div className="site-settings__general-settings-launch-site">
					<div className="site-settings__general-settings-launch-site-text">
						<p>
							{ isComingSoon || isPrivateAndUnlaunched
								? translate(
										'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
								  )
								: translate(
										"Your site hasn't been launched yet. It's private; only you can see it until it is launched."
								  ) }
						</p>
						{ isDevelopmentSite && (
							<p>
								{ agencyLoading || agencyError
									? translate(
											'Once the site is launched, your agency will be billed for this site in the next billing cycle.'
									  )
									: translate(
											'Once the site is launched, {{strong}}%(agencyName)s{{/strong}} will be billed for this site in the next billing cycle.',
											{
												args: {
													agencyName: agencyName,
												},
												components: {
													strong: <strong />,
												},
												comment: 'name of the agency that will be billed for the site',
											}
									  ) }
							</p>
						) }
					</div>
					<div className={ launchSiteClasses }>{ btnComponent }</div>
					{ isDevelopmentSite && (
						<div className={ launchSiteClasses }>
							<Button onClick={ handleReferToClient } disabled={ false }>
								{ translate( 'Refer to client' ) }
							</Button>
						</div>
					) }
				</div>
			</LaunchCard>
			{ showPreviewLink && (
				<Card>
					<SitePreviewLink siteUrl={ site.URL } siteId={ siteId } source="launch-settings" />
				</Card>
			) }

			{ querySiteDomainsComponent }
		</>
	);
};

export default LaunchSite;
