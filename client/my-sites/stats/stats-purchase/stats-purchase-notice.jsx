import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { trackStatsAnalyticsEvent } from '../utils';
import {
	StatsBenefitsCommercial,
	StatsBenefitsPersonal,
	StatsBenefitsFree,
	StatsSingleItemPagePurchaseFrame,
} from './stats-purchase-shared';
import './styles.scss';

const getStatsPurchaseURL = ( siteId, productType = 'commercial' ) =>
	`/stats/purchase/${ siteId }?productType=${ productType }`;

const handleUpgradeClick = ( event, upgradeUrl, isOdysseyStats ) => {
	event.preventDefault();

	isOdysseyStats
		? recordTracksEvent( 'jetpack_odyssey_stats_purchase_summary_screen_upgrade_clicked' )
		: recordTracksEvent( 'calypso_stats_purchase_summary_screen_upgrade_clicked' );

	trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
		type: 'summary-screen',
	} );

	setTimeout( () => page( upgradeUrl ), 250 );
};

const StatsCommercialOwned = ( { siteSlug } ) => {
	const translate = useTranslate();

	const handleClick = () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;

		page.redirect( trafficPageUrl );
	};

	return (
		<>
			<h1>
				{ translate( 'You already have a commercial license for %(product)s.', {
					args: { product: STATS_PRODUCT_NAME },
				} ) }
			</h1>
			<p>
				{ translate(
					'You already have a license for this product and it has been successfully activated. You currently have access to:'
				) }
			</p>
			<StatsBenefitsCommercial />
			<Button variant="secondary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>
		</>
	);
};

const StatsPWYWOwnedNotice = ( { siteId, siteSlug } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const handleClick = () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;

		page.redirect( trafficPageUrl );
	};

	return (
		<StatsSingleItemPagePurchaseFrame>
			<h1>
				{ translate( 'You already have a license for %(product)s.', {
					args: { product: STATS_PRODUCT_NAME },
				} ) }
			</h1>
			<p>
				{ translate(
					'You already have a license for this product and it has been successfully activated. You currently have access to:'
				) }
			</p>
			<StatsBenefitsPersonal />
			<Button variant="secondary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>
			<Button
				variant="primary"
				onClick={ ( e ) =>
					handleUpgradeClick( e, getStatsPurchaseURL( siteId, 'commercial' ), isOdysseyStats )
				}
			>
				{ translate( 'Upgrade my Stats' ) }
			</Button>
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsFreeOwnedNotice = ( { siteId, siteSlug } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const handleClick = () => {
		if ( ! siteSlug ) {
			return;
		}
		const trafficPageUrl = `/stats/day/${ siteSlug }`;

		page.redirect( trafficPageUrl );
	};

	return (
		<StatsSingleItemPagePurchaseFrame>
			<h1>
				{ translate( 'You already have a free license for %(product)s.', {
					args: { product: STATS_PRODUCT_NAME },
				} ) }
			</h1>
			<p>
				{ translate(
					'You already have a license for this product and it has been successfully activated. You currently have access to:'
				) }
			</p>
			<StatsBenefitsFree />
			<Button variant="secondary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>

			<Button
				variant="primary"
				onClick={ ( e ) =>
					handleUpgradeClick( e, getStatsPurchaseURL( siteId, 'personal' ), isOdysseyStats )
				}
			>
				{ translate( 'Upgrade my Stats' ) }
			</Button>
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsPurchaseNotice = ( { siteSlug } ) => {
	return (
		<StatsSingleItemPagePurchaseFrame>
			<StatsCommercialOwned siteSlug={ siteSlug } />
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsPurchaseNoticePage = ( {
	siteId,
	siteSlug,
	isCommercialOwned,
	isFreeOwned,
	isPWYWOwned,
} ) => {
	return (
		<div className="stats-purchase-page__notice">
			{ isCommercialOwned && <StatsPurchaseNotice siteSlug={ siteSlug } /> }
			{ isPWYWOwned && ! isCommercialOwned && (
				<StatsPWYWOwnedNotice siteId={ siteId } siteSlug={ siteSlug } />
			) }
			{ isFreeOwned && ! isPWYWOwned && ! isCommercialOwned && (
				<StatsFreeOwnedNotice siteId={ siteId } siteSlug={ siteSlug } />
			) }
		</div>
	);
};

export { StatsPurchaseNoticePage, StatsPurchaseNotice, getStatsPurchaseURL };
