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
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = (
	siteId: number | null,
	isOdysseyStats: boolean,
	hasFreeStats = false
) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/paid-wpcom-stats&from=${ from }-stats-upgrade-notice${
		hasFreeStats ? '&productType=personal' : ''
	}`;
	return purchasePath;
};

const DoYouLoveJetpackStatsNotice = ( {
	siteId,
	hasFreeStats,
	isOdysseyStats,
}: StatsNoticeProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'do_you_love_jetpack_stats',
		'postponed',
		30 * 24 * 3600
	);

	const dismissNotice = () => {
		isOdysseyStats
			? recordTracksEvent( 'jetpack_odyssey_stats_do_you_love_jetpack_stats_notice_dismissed' )
			: recordTracksEvent( 'calypso_stats_do_you_love_jetpack_stats_notice_dismissed' );

		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	const gotoJetpackStatsProduct = () => {
		isOdysseyStats
			? recordTracksEvent(
					'jetpack_odyssey_stats_do_you_love_jetpack_stats_notice_support_button_clicked'
			  )
			: recordTracksEvent(
					'calypso_stats_do_you_love_jetpack_stats_notice_support_button_clicked'
			  );
		// Allow some time for the event to be recorded before redirecting.
		setTimeout( () => page( getStatsPurchaseURL( siteId, isOdysseyStats, hasFreeStats ) ), 250 );
	};

	useEffect( () => {
		if ( ! noticeDismissed ) {
			isOdysseyStats
				? recordTracksEvent( 'jetpack_odyssey_stats_do_you_love_jetpack_stats_notice_viewed' )
				: recordTracksEvent( 'calypso_stats_do_you_love_jetpack_stats_notice_viewed' );
		}
	}, [ noticeDismissed, isOdysseyStats ] );

	if ( noticeDismissed ) {
		return null;
	}

	const noPurchaseTitle = translate( 'Do you love Jetpack Stats?' );
	const freeTitle = translate( 'Want to get the most out of Jetpack Stats?' );

	const learnMoreLink = isWPCOMSite
		? 'https://wordpress.com/support/stats/#purchase-the-stats-add-on'
		: 'https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing';

	return (
		<div
			className={ `inner-notice-container has-odyssey-stats-bg-color ${
				! isOdysseyStats && 'inner-notice-container--calypso'
			}` }
		>
			<NoticeBanner
				level="info"
				title={ hasFreeStats ? freeTitle : noPurchaseTitle }
				onClose={ dismissNotice }
			>
				{ translate(
					'{{p}}Upgrade to get priority support and access to upcoming advanced features.{{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{learnMoreLink}}{{learnMoreLinkText}}Learn more{{/learnMoreLinkText}}{{externalIcon /}}{{/learnMoreLink}}{{/p}}',
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
							learnMoreLink: (
								<a
									className="notice-banner__action-link"
									href={ localizeUrl( learnMoreLink ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
							learnMoreLinkText: <span />,
							externalIcon: <Icon className="stats-icon" icon={ external } size={ 24 } />,
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

export default DoYouLoveJetpackStatsNotice;
