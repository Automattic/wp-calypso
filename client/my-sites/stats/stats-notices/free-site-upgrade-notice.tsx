import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { HelpCenter } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { STATS_FREE_SITE_UPGRADE_NOTICE } from '../constants';
import { trackStatsAnalyticsEvent } from '../utils';
import { StatsNoticeProps } from './types';

const HELP_CENTER_STORE = HelpCenter.register();

const getStatsPurchaseURL = ( siteId: number | null, isOdysseyStats: boolean ) => {
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	return `/stats/purchase/${ siteId }?from=${ from }-stats-free-site-upgrade-notice&productType=commercial`;
};

const FreeSiteUpgradeNotice = ( { siteId, hasFreeStats, isOdysseyStats }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const isWPCOMPaidStatsFlow =
		isEnabled( 'stats/paid-wpcom-v2' ) && isWPCOMSite && ! isOdysseyStats;
	const dispatch = useDispatch();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	// Dismissal is news-based, not time-based: it never returns on a timer, and a future
	// campaign re-reaches past dismissers by shipping under a fresh notice id.
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'free_site_upgrade',
		'postponed',
		3650 * 24 * 3600
	);
	const { setShowHelpCenter, setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );

	const dismissNotice = () => {
		recordTracksEvent(
			isOdysseyStats
				? 'jetpack_odyssey_stats_free_site_upgrade_notice_dismissed'
				: 'calypso_stats_free_site_upgrade_notice_dismissed'
		);

		setNoticeDismissed( true );
		// Best-effort: the local state above already hides the notice for this session.
		postponeNoticeAsync().catch( () => {} );
	};

	const openWPCOMPaidStatsUpsellModal = () => {
		recordTracksEvent( 'calypso_stats_free_site_upgrade_notice_upgrade_button_clicked' );
		dispatch( toggleUpsellModal( siteId, STATS_FREE_SITE_UPGRADE_NOTICE ) );
	};

	const gotoJetpackStatsProduct = () => {
		recordTracksEvent(
			isOdysseyStats
				? 'jetpack_odyssey_stats_free_site_upgrade_notice_support_button_clicked'
				: 'calypso_stats_free_site_upgrade_notice_support_button_clicked'
		);

		trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
			type: 'notice-free-site-upgrade',
		} );

		// Allow some time for the event to be recorded before redirecting.
		setTimeout( () => page( getStatsPurchaseURL( siteId, isOdysseyStats ) ), 250 );
	};

	const handleCTAClick = () => {
		if ( isWPCOMPaidStatsFlow ) {
			return openWPCOMPaidStatsUpsellModal();
		}
		gotoJetpackStatsProduct();
	};

	useEffect( () => {
		if ( ! noticeDismissed ) {
			recordTracksEvent(
				isOdysseyStats
					? 'jetpack_odyssey_stats_free_site_upgrade_notice_viewed'
					: 'calypso_stats_free_site_upgrade_notice_viewed'
			);
		}
	}, [ noticeDismissed, isOdysseyStats ] );

	if ( noticeDismissed ) {
		return null;
	}

	const noPurchaseTitle = isWPCOMPaidStatsFlow
		? ( translate( 'Grow faster with %(product)s', {
				args: { product: STATS_PRODUCT_NAME },
		  } ) as string )
		: ( translate( 'Unlock more Stats with a paid plan' ) as string );
	const freeTitle = translate( 'Want to get the most out of %(product)s?', {
		args: { product: STATS_PRODUCT_NAME },
	} ) as string;

	const learnMoreLink = isWPCOMSite
		? 'https://wordpress.com/support/stats/#purchase-the-stats-add-on'
		: 'https://jetpack.com/support/jetpack-stats/free-or-paid/#what-a-paid-plan-adds';

	const description = isWPCOMPaidStatsFlow
		? translate(
				'Finesse your scaling-up strategy with detailed insights and data. Upgrade to the %s plan for a richer understanding and smarter decision-making.',
				{
					args: getPlan( PLAN_PREMIUM )?.getTitle() ?? '',
				}
		  )
		: translate(
				'%(product)s is free to keep using. A paid plan adds UTM stats, device stats, and region and city stats.',
				{ args: { product: STATS_PRODUCT_NAME } }
		  );

	const CTAText = translate( 'Upgrade' );

	const localizedLearnMoreLink = localizeUrl( learnMoreLink );
	const openHelpCenter = () => {
		setShowHelpCenter( true );
		setShowSupportDoc( localizedLearnMoreLink );
	};

	return (
		<div
			className={ `inner-notice-container ${
				! isOdysseyStats ? 'inner-notice-container--calypso' : ''
			}` }
		>
			<NoticeBanner
				level="info"
				title={ hasFreeStats ? freeTitle : noPurchaseTitle }
				onClose={ dismissNotice }
			>
				<p key="desc">{ description }</p>
				<p key="cta">
					<button type="button" className="notice-banner__action-button" onClick={ handleCTAClick }>
						{ CTAText }
					</button>
					<a
						className="notice-banner__action-link"
						href={ localizedLearnMoreLink }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ ( event ) => {
							if ( ! isOdysseyStats && isWPCOMSite ) {
								event.preventDefault();
								openHelpCenter();
							}
						} }
					>
						{ translate( 'Learn more' ) }
						<Icon className="stats-icon" icon={ external } size={ 24 } />
					</a>
				</p>
			</NoticeBanner>
		</div>
	);
};

export default FreeSiteUpgradeNotice;
