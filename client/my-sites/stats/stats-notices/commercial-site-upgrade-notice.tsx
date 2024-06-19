import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { trackStatsAnalyticsEvent } from '../utils';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?from=${ from }-stats-commercial-site-upgrade-notice&productType=commercial`;
	return purchasePath;
};

const CommercialSiteUpgradeNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'commercial_site_upgrade',
		'postponed',
		30 * 24 * 3600
	);

	const dismissNotice = () => {
		isOdysseyStats
			? recordTracksEvent( 'jetpack_odyssey_stats_commercial_site_upgrade_notice_dismissed' )
			: recordTracksEvent( 'calypso_stats_commercial_site_upgrade_notice_dismissed' );

		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	const gotoJetpackStatsProduct = () => {
		isOdysseyStats
			? recordTracksEvent(
					'jetpack_odyssey_stats_commercial_site_upgrade_notice_support_button_clicked'
			  )
			: recordTracksEvent( 'calypso_stats_commercial_site_upgrade_notice_support_button_clicked' );

		trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
			type: 'notice-commercial',
		} );

		// Allow some time for the event to be recorded before redirecting.
		setTimeout( () => page( getStatsPurchaseURL( siteId, isOdysseyStats ) ), 250 );
	};

	useEffect( () => {
		if ( ! noticeDismissed ) {
			isOdysseyStats
				? recordTracksEvent( 'jetpack_odyssey_stats_commercial_site_upgrade_notice_viewed' )
				: recordTracksEvent( 'calypso_stats_commercial_site_upgrade_notice_viewed' );
		}
	}, [ noticeDismissed, isOdysseyStats ] );

	if ( noticeDismissed ) {
		return null;
	}

	const learnMoreLink = isWPCOMSite
		? 'https://wordpress.com/support/stats/#purchase-the-stats-add-on'
		: 'https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing';

	const hideCloseButton = true; // currently hiding close button and dismiss click functionality is disabled for all commerical upgrade notices. To add more specific conditionals later, we can modify here

	return (
		<div
			className={ `inner-notice-container has-odyssey-stats-bg-color ${
				! isOdysseyStats && 'inner-notice-container--calypso'
			}` }
		>
			<NoticeBanner
				level="info"
				title={ translate( 'Upgrade to Stats Commercial' ) }
				onClose={ hideCloseButton ? () => {} : dismissNotice }
				hideCloseButton={ hideCloseButton }
			>
				{ translate(
					'{{p}}Upgrade to get priority support and access to upcoming advanced features. You’ll need to purchase a commercial license based on your site type. {{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
					{
						components: {
							p: <p />,
							jetpackStatsProductLink: (
								<button
									type="button"
									className="notice-banner__action-button"
									onClick={ gotoJetpackStatsProduct }
								/>
							),
							commercialUpgradeLink: (
								<a
									className="notice-banner__action-link"
									href={ localizeUrl( learnMoreLink ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
							commercialUpgradeLinkText: <span />,
							externalIcon: <Icon className="stats-icon" icon={ external } size={ 24 } />,
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

export default CommercialSiteUpgradeNotice;
