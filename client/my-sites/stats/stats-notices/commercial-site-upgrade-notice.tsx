import { recordTracksEvent } from '@automattic/calypso-analytics';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/paid-stats&from=${ from }-stats-commercial-site-upgrade-notice`;
	if ( ! isOdysseyStats ) {
		return purchasePath;
	}
	// We use absolute path here as it runs in Odyssey as well.
	return `https://wordpress.com${ purchasePath }`;
};

const CommercialSiteUpgradeNotice = ( { siteId, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
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
		// Allow some time for the event to be recorded before redirecting.
		setTimeout(
			() => ( window.location.href = getStatsPurchaseURL( siteId, isOdysseyStats ) ),
			250
		);
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

	return (
		<div
			className={ `inner-notice-container has-odyssey-stats-bg-color ${
				! isOdysseyStats && 'inner-notice-container--calypso'
			}` }
		>
			<NoticeBanner
				level="info"
				title={ translate( 'Upgrade my Stats' ) }
				onClose={ dismissNotice }
			>
				{ translate(
					'{{p}}Upgrade to get priority support and access to upcoming advanced features. You’ll need to purchase a commercial license base on your site type. {{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{commercialUpgradeLink}}{{commercialUpgradeLinkText}}Learn more{{/commercialUpgradeLinkText}}{{externalIcon /}}{{/commercialUpgradeLink}}{{/p}}',
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
									href="https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing"
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
