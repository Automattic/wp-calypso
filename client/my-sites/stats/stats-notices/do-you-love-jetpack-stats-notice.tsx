import { recordTracksEvent } from '@automattic/calypso-analytics';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/paid-stats,stats/paid-wpcom-stats&from=${ from }-stats-upgrade-notice`;
	if ( ! isOdysseyStats ) {
		return purchasePath;
	}
	// We use absolute path here as it runs in Odyssey as well.
	return `https://wordpress.com${ purchasePath }`;
};

const DoYouLoveJetpackStatsNotice = ( {
	siteId,
	hasFreeStats,
	isOdysseyStats,
}: StatsNoticeProps ) => {
	const translate = useTranslate();
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
		setTimeout(
			() => ( window.location.href = getStatsPurchaseURL( siteId, isOdysseyStats ) ),
			250
		);
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
					'{{p}}Upgrade Jetpack Stats to unlock priority support and all upcoming premium features.{{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{learnMoreLink}}{{learnMoreLinkText}}Learn more{{/learnMoreLinkText}}{{externalIcon /}}{{/learnMoreLink}}{{/p}}',
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
									href="https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing"
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
