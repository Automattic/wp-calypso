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

const StatsPurchaseNotice = ( { siteSlug } ) => {
	return (
		<StatsSingleItemPagePurchaseFrame>
			<StatsCommercialOwned siteSlug={ siteSlug } />
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsPurchaseNoticePage = ( { siteSlug, isCommercialOwned, isFreeOwned, isPWYWOwned } ) => {
	return (
		<>
			{ isCommercialOwned && (
				<div className="stats-purchase-page__notice">
					<StatsPurchaseNotice siteSlug={ siteSlug } />
				</div>
			) }
			{ ( isFreeOwned || isPWYWOwned ) && (
				<>
					{
						// TODO: add a banner handling information about existing purchase
					 }
				</>
			) }
		</>
	);
};

export { StatsPurchaseNoticePage, StatsPurchaseNotice };
