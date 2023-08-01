import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/paid-stats&from=${ from }-stats-upgrade-notice`;
	if ( ! isOdysseyStats ) {
		return purchasePath;
	}
	// We use absolute path here as it runs in Odyssey as well.
	return `https://wordpress.com${ purchasePath }`;
};

const DoYouLoveJetpackStatsNotice = ( { siteId }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showNotice } = useNoticeVisibilityQuery( siteId, 'do_you_love_jetpack_stats' );
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
		// TODO: use Jetpack Redirects for more precise tracking for Odyssey.
		// Allow some time for the event to be recorded before redirecting.
		setTimeout(
			() => ( window.location.href = getStatsPurchaseURL( siteId, isOdysseyStats ) ),
			250
		);
	};

	useEffect( () => {
		if ( ! noticeDismissed && showNotice ) {
			isOdysseyStats
				? recordTracksEvent( 'jetpack_odyssey_stats_do_you_love_jetpack_stats_notice_viewed' )
				: recordTracksEvent( 'calypso_stats_do_you_love_jetpack_stats_notice_viewed' );
		}
	}, [ noticeDismissed, showNotice, isOdysseyStats ] );

	if ( noticeDismissed || ! showNotice ) {
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
				title={ translate( 'Do you love Jetpack Stats?' ) }
				onClose={ dismissNotice }
			>
				{ translate(
					'{{p}}Upgrade Jetpack Stats to unlock upcoming features and priority support.{{/p}}{{p}}{{jetpackStatsProductLink}}Upgrade my Stats{{/jetpackStatsProductLink}} {{learnMoreLink}}{{learnMoreLinkText}}Learn more{{/learnMoreLinkText}}{{externalIcon /}}{{/learnMoreLink}}{{/p}}',
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
									href="https://jetpack.com/support/jetpack-stats/free-or-paid/"
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
