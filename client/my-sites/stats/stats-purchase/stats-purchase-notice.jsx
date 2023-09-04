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

const REDIRECT_JETPACK_FREE = 'jetpack-free-stats-purchase-summary-screen-notice';
const REDIRECT_CALYPSO_FREE = 'calypso-free-stats-purchase-summary-screen-notice';
const REDIRECT_JETPACK_PERSONAL = 'jetpack-paid-stats-purchase-summary-screen-notice';
const REDIRECT_CALYPSO_PERSONAL = 'calypso-paid-stats-purchase-summary-screen-notice';

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
					'It appears that you have already purchased a license for this product, and it has been successfully activated. You now have access to:'
				) }
			</p>
			<StatsBenefitsCommercial />
			<Button variant="primary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>
		</>
	);
};

const StatsPWYWOwnedNotice = ( { siteSlug } ) => {
	const translate = useTranslate();

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
			<Button variant="primary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsFreeOwnedNotice = ( { siteSlug } ) => {
	const translate = useTranslate();

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
					'It appears that you have already purchased a license for this product, and it has been successfully activated. You now have access to:'
				) }
			</p>
			<StatsBenefitsFree />
			<Button variant="primary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
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

export {
	StatsPurchaseNoticePage,
	StatsPurchaseNotice,
	REDIRECT_CALYPSO_FREE,
	REDIRECT_JETPACK_FREE,
	REDIRECT_CALYPSO_PERSONAL,
	REDIRECT_JETPACK_PERSONAL,
};
