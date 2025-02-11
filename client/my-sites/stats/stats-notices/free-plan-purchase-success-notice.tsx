import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { removeStatsPurchaseSuccessParamFromCurrentUrl } from './lib/remove-stats-purchase-success-param';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null ) => {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const from = isOdysseyStats ? 'jetpack' : 'calypso';
	const purchasePath = `/stats/purchase/${ siteId }?productType=personal&from=${ from }-free-stats-purchase-success-notice`;

	return purchasePath;
};

const handleUpgradeClick = (
	event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
	upgradeUrl: string,
	isOdysseyStats: boolean
) => {
	event.preventDefault();

	isOdysseyStats
		? recordTracksEvent( 'jetpack_odyssey_stats_purchase_success_banner_upgrade_clicked' )
		: recordTracksEvent( 'calypso_stats_purchase_success_banner_upgrade_clicked' );

	setTimeout( () => page( upgradeUrl ), 250 );
};

const FreePlanPurchaseSuccessJetpackStatsNotice = ( {
	siteId,
	isOdysseyStats,
}: StatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const [ paramRemoved, setParamRemoved ] = useState( false );

	useEffect( () => {
		if ( paramRemoved ) {
			return;
		}
		// Ensure it runs only once.
		setParamRemoved( true );
		removeStatsPurchaseSuccessParamFromCurrentUrl( isOdysseyStats );
	}, [ paramRemoved, isOdysseyStats ] );

	const dismissNotice = () => setNoticeDismissed( true );

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
				level="success"
				title={
					translate( 'Thank you for using %(product)s!', {
						args: { product: STATS_PRODUCT_NAME },
					} ) as string
				}
				onClose={ dismissNotice }
			>
				{ translate(
					'{{p}}We appreciate your continued support. If you want to access upcoming features, {{jetpackStatsProductLink}} please consider upgrading{{/jetpackStatsProductLink}}.{{/p}}',
					{
						components: {
							p: <p />,
							jetpackStatsProductLink: (
								<a
									onClick={ ( e ) =>
										handleUpgradeClick( e, getStatsPurchaseURL( siteId ), isOdysseyStats )
									}
									className="notice-banner__action-link notice-banner__action-link--inline"
									href={ getStatsPurchaseURL( siteId ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

export default FreePlanPurchaseSuccessJetpackStatsNotice;
