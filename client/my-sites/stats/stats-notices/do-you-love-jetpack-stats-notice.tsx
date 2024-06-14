import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { STATS_DO_YOU_LOVE_JETPACK_STATS_NOTICE } from '../constants';
import { trackStatsAnalyticsEvent } from '../utils';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = (
	siteId: number | null,
	isOdysseyStats: boolean,
	hasFreeStats = false
) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?from=${ from }-stats-upgrade-notice${
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
	const hasEnTranslation = useHasEnTranslation();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const isWPCOMPaidStatsFlow =
		isEnabled( 'stats/paid-wpcom-v2' ) && isWPCOMSite && ! isOdysseyStats;
	const dispatch = useDispatch();
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

	const openWPCOMPaidStatsUpsellModal = () => {
		recordTracksEvent( 'calypso_stats_do_you_love_jetpack_stats_notice_upgrade_button_clicked' );
		dispatch( toggleUpsellModal( siteId, STATS_DO_YOU_LOVE_JETPACK_STATS_NOTICE ) );
	};

	const gotoJetpackStatsProduct = () => {
		isOdysseyStats
			? recordTracksEvent(
					'jetpack_odyssey_stats_do_you_love_jetpack_stats_notice_support_button_clicked'
			  )
			: recordTracksEvent(
					'calypso_stats_do_you_love_jetpack_stats_notice_support_button_clicked'
			  );

		trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
			type: 'notice-love-stats',
		} );

		// Allow some time for the event to be recorded before redirecting.
		setTimeout( () => page( getStatsPurchaseURL( siteId, isOdysseyStats, hasFreeStats ) ), 250 );
	};

	const handleCTAClick = () => {
		if ( isWPCOMPaidStatsFlow ) {
			return openWPCOMPaidStatsUpsellModal();
		}
		gotoJetpackStatsProduct();
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

	const noPurchaseTitle = isWPCOMPaidStatsFlow
		? translate( 'Grow faster with Jetpack Stats' )
		: translate( 'Do you love Jetpack Stats?' );
	const freeTitle = translate( 'Want to get the most out of Jetpack Stats?' );

	const learnMoreLink = isWPCOMSite
		? 'https://wordpress.com/support/stats/#purchase-the-stats-add-on'
		: 'https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing';

	const paidStatsRemoveHardcoding = hasEnTranslation(
		'Finesse your scaling-up strategy with detailed insights and data. Upgrade to a %s plan for a richer understanding and smarter decision-making.'
	)
		? translate(
				'Finesse your scaling-up strategy with detailed insights and data. Upgrade to a %s plan for a richer understanding and smarter decision-making.',
				{
					args: {
						planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '',
					},
				}
		  )
		: translate(
				'Finesse your scaling-up strategy with detailed insights and data. Upgrade to an Explorer plan for a richer understanding and smarter decision-making.'
		  );
	const description = isWPCOMPaidStatsFlow
		? paidStatsRemoveHardcoding
		: translate( 'Upgrade to support future development and stop the upgrade banners.' );

	const CTAText = isWPCOMPaidStatsFlow ? translate( 'Upgrade' ) : translate( 'Upgrade my Stats' );

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
				<p>{ description }</p>
				<p>
					<button type="button" className="notice-banner__action-button" onClick={ handleCTAClick }>
						{ CTAText }
					</button>
					<a
						className="notice-banner__action-link"
						href={ localizeUrl( learnMoreLink ) }
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'Learn more' ) }
						<Icon className="stats-icon" icon={ external } size={ 24 } />
					</a>
				</p>
			</NoticeBanner>
		</div>
	);
};

export default DoYouLoveJetpackStatsNotice;
