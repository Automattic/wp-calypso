import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import {
	StatsBenefitsCommercial,
	StatsBenefitsPersonal,
	StatsBenefitsFree,
	StatsSingleItemPagePurchaseFrame,
} from './stats-purchase-shared';
import './styles.scss';

const getStatsPurchaseURL = ( siteId, productType = 'commercial' ) =>
	`/stats/purchase/${ siteId }?productType=${ productType }&flags=stats/type-detection`;

const handleUpgradeClick = ( event, upgradeUrl, isOdysseyStats ) => {
	event.preventDefault();

	isOdysseyStats
		? recordTracksEvent( 'jetpack_odyssey_stats_purchase_summary_screen_upgrade_clicked' )
		: recordTracksEvent( 'calypso_stats_purchase_summary_screen_upgrade_clicked' );

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
			<h1>{ translate( 'You have already purchased Jetpack Stats Commercial!' ) }</h1>
			<p>
				{ translate(
					'It appears that you have already purchased a license or a plan that supports this product, and it has been successfully activated. You now have access to:'
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
			<h1>{ translate( 'You have already purchased Jetpack Stats Personal Plan!' ) }</h1>
			<p>
				{ translate(
					'It appears that you have already purchased a license for this product, and it has been successfully activated. You now have access to:'
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
		<StatsSingleItemPagePurchaseFrame isFree>
			<h1>{ translate( 'You have already purchased Jetpack Stats Free Plan!' ) }</h1>
			<p>
				{ translate(
					'You already have a free license for this product, and it has been successfully activated. Currently have access to:'
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
