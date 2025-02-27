import { WPCOM_FEATURES_SITE_PREVIEW_LINKS } from '@automattic/calypso-products';
import { Card, CompactCard, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { formatCurrency, translate } from 'i18n-calypso';
import { useState } from 'react';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import SitePreviewLinks from 'calypso/components/site-preview-links';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useSelector, useDispatch } from 'calypso/state';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import getIsUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { getIsSiteLaunchInProgress } from 'calypso/state/sites/launch/selectors';
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
import { LaunchConfirmationModal } from './launch-confirmation-modal';
import { LaunchSiteTrialUpsellNotice } from './launch-site-trial-notice';

import './styles.scss';

const createAgencyBillingMessage = ( agency, agencyLoading = false, agencyError = false ) => {
	if ( ! agency ) {
		return undefined;
	}

	const agencyPriceInfoIsDefined =
		Number.isFinite( agency.prices?.actual_price ) && typeof agency.prices?.currency === 'string';

	if ( agencyLoading || agencyError || ! agencyPriceInfoIsDefined ) {
		return translate( "After launch, we'll bill your agency in the next billing cycle." );
	}

	const agencyName = agency.name;
	const existingWPCOMLicenseCount = agency.existing_wpcom_license_count || 0;
	const price = formatCurrency( agency.prices.actual_price, agency.prices.currency );

	return translate(
		"After launch, we'll bill {{strong}}%(agencyName)s{{/strong}} in the next billing cycle. With %(licenseCount)s production hosting license, you will be charged %(price)s / license / month. {{a}}Learn more.{{/a}}",
		"After launch, we'll bill {{strong}}%(agencyName)s{{/strong}} in the next billing cycle. With %(licenseCount)s production hosting licenses, you will be charged %(price)s / license / month. {{a}}Learn more.{{/a}}",
		{
			count: existingWPCOMLicenseCount + 1,
			args: {
				agencyName,
				licenseCount: existingWPCOMLicenseCount + 1,
				price,
			},
			components: {
				strong: <strong />,
				a: (
					<a
						className="site-settings__general-settings-launch-site-agency-learn-more"
						href={ localizeUrl(
							'https://agencieshelp.automattic.com/knowledge-base/free-development-licenses-for-wordpress-com-hosting/'
						) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
			comment:
				'agencyName: name of the agency that will be billed for the site; licenseCount: number of licenses the agency will be billed for; price: price per license',
		}
	);
};

const LaunchSite = () => {
	const [ isLaunchConfirmationModalOpen, setLaunchConfirmationModalOpen ] = useState( false );
	const openLaunchConfirmationModal = () => setLaunchConfirmationModalOpen( true );
	const closeLaunchConfirmationModal = () => setLaunchConfirmationModalOpen( false );

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
	const isLaunchInProgress = useSelector( ( state ) => getIsSiteLaunchInProgress( state, siteId ) );

	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	const launchSiteClasses = clsx( 'site-settings__general-settings-launch-site-button', {
		'site-settings__disable-privacy-settings': ! siteDomains.length,
	} );
	const btnText = translate( 'Launch site' );

	const isDevelopmentSite = Boolean( site?.is_a4a_dev_site );

	const dispatchSiteLaunch = () => {
		dispatch( launchSite( site.ID ) );
	};

	const {
		data: agency,
		error: agencyError,
		isLoading: agencyLoading,
	} = useFetchAgencyFromBlog( site?.ID, { enabled: !! site?.ID && isDevelopmentSite } );

	const siteReferralActive = agency?.referral_status === 'active';
	const shouldShowReferToClientButton =
		isDevelopmentSite && ! siteReferralActive && ! agencyLoading;
	const shouldShowAgencyBillingMessage =
		isDevelopmentSite && ! siteReferralActive && ! agencyLoading;

	const handleLaunchSiteClick = () => {
		if ( isDevelopmentSite && ! siteReferralActive ) {
			openLaunchConfirmationModal();
		} else {
			dispatchSiteLaunch();
		}
	};

	let querySiteDomainsComponent;
	let btnComponent;
	if ( 0 === siteDomains.length ) {
		querySiteDomainsComponent = <QuerySiteDomains siteId={ siteId } />;
		btnComponent = <Button>{ btnText }</Button>;
	} else if ( isPaidPlan && siteDomains.length > 1 ) {
		btnComponent = (
			<Button
				onClick={ handleLaunchSiteClick }
				busy={ isLaunchInProgress }
				disabled={ ! isLaunchable || ( isDevelopmentSite && agencyLoading ) }
			>
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

	const handleReferToClient = () => {
		window.location.href = `https://agencies.automattic.com/marketplace/checkout?referral_blog_id=${ siteId }`;
	};

	const agencyBillingMessage = createAgencyBillingMessage( agency, agencyLoading, agencyError );

	const renderConfirmationModal = () => {
		return (
			isLaunchConfirmationModalOpen && (
				<LaunchConfirmationModal
					message={ agencyBillingMessage }
					closeModal={ closeLaunchConfirmationModal }
					onConfirmation={ () => {
						dispatchSiteLaunch();
						closeLaunchConfirmationModal();
					} }
				/>
			)
		);
	};

	const renderContent = () => {
		return (
			<>
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
						{ shouldShowAgencyBillingMessage && <i>{ agencyBillingMessage }</i> }
					</div>
					<div className={ launchSiteClasses }>{ btnComponent }</div>
					{ shouldShowReferToClientButton && (
						<div className="site-settings__general-settings-refer-to-client-button">
							<Button onClick={ handleReferToClient } disabled={ isLaunchInProgress }>
								{ translate( 'Refer to client' ) }
							</Button>
						</div>
					) }
				</div>
			</>
		);
	};

	const renderPreviewLinks = () => {
		return <SitePreviewLinks siteUrl={ site.URL } siteId={ siteId } source="launch-settings" />;
	};

	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();

	return (
		<>
			{ renderConfirmationModal() }
			{ ! isUntangled ? (
				<>
					<SettingsSectionHeader title={ translate( 'Launch site' ) } />
					<LaunchCard>{ renderContent() }</LaunchCard>
				</>
			) : (
				<PanelCard>
					<PanelCardHeading>{ translate( 'Launch site' ) }</PanelCardHeading>
					{ renderContent() }
				</PanelCard>
			) }
			{ showPreviewLink &&
				( ! isUntangled ? (
					<Card>{ renderPreviewLinks() }</Card>
				) : (
					<PanelCard>
						<PanelCardHeading>{ translate( 'Coming soon' ) }</PanelCardHeading>
						{ renderPreviewLinks() }
					</PanelCard>
				) ) }
			{ querySiteDomainsComponent }
		</>
	);
};

export default LaunchSite;
