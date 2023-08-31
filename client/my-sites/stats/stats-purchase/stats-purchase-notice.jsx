import NoticeBanner from '@automattic/components/src/notice-banner';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { StatsBenefits, StatsSingleItemPagePurchaseFrame } from './stats-purchase-shared';
import './styles.scss';

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
			<StatsBenefits />
			<Button variant="primary" onClick={ handleClick }>
				{ translate( 'See your stats' ) }
			</Button>
		</>
	);
};

const StatsPWYWOwned = () => {
	const translate = useTranslate();

	return (
		<>
			<div className="stats-purchase-page__notice--with-banner">
				<NoticeBanner
					level="success"
					title={ translate( 'Thank you for using Jetpack Stats!' ) }
					hideCloseButton
				>
					{ translate(
						'You have already purchased a personal plan. If you want to upgrade to a commercial plan you can do it below.'
					) }
				</NoticeBanner>
			</div>
		</>
	);
};

const StatsFreeOwned = () => {
	const translate = useTranslate();

	return (
		<div className="stats-purchase-page__notice--with-banner">
			<NoticeBanner
				level="success"
				title={ translate( 'Thank you for using Jetpack Stats!' ) }
				hideCloseButton
			>
				{ translate(
					'We appreciate your continued support. If you want to access upcoming features, please consider upgrading.'
				) }
			</NoticeBanner>
		</div>
	);
};

const StatsPurchaseNotice = ( { siteSlug } ) => {
	return (
		<StatsSingleItemPagePurchaseFrame>
			<StatsCommercialOwned siteSlug={ siteSlug } />
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsPurchaseNoticePage = ( { siteSlug, isCommercialOwned, isFreeOwned, isPWYWOwned } ) => {
	return (
		<div className="stats-purchase-page__notice">
			{ isCommercialOwned && <StatsPurchaseNotice siteSlug={ siteSlug } /> }
			{ isPWYWOwned && <StatsPWYWOwned /> }
			{ isFreeOwned && <StatsFreeOwned /> }
		</div>
	);
};

export { StatsPurchaseNoticePage, StatsPurchaseNotice };
