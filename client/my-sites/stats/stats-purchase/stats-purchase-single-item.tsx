import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import {
	StatsCommercialPriceDisplay,
	StatsBenefitsCommercial,
	StatsSingleItemPagePurchaseFrame,
} from './stats-purchase-shared';
import './styles.scss';

interface StatsCommercialPurchaseProps {
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	adminUrl: string;
	redirectUri: string;
	from: string;
}

interface StatsSingleItemPagePurchaseProps {
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	redirectUri: string;
	from: string;
	siteId: number | null;
}

const StatsCommercialPurchase = ( {
	siteSlug,
	planValue,
	currencyCode,
	from,
	adminUrl,
	redirectUri,
}: StatsCommercialPurchaseProps ) => {
	const translate = useTranslate();

	return (
		<>
			<h1>{ translate( 'Jetpack Stats Commercial' ) }</h1>
			<p>{ translate( 'The most advanced stats Jetpack has to offer.' ) }</p>
			<StatsBenefitsCommercial />
			<StatsCommercialPriceDisplay planValue={ planValue } currencyCode={ currencyCode } />
			<Button
				variant="primary"
				onClick={ () =>
					gotoCheckoutPage( { from, type: 'commercial', siteSlug, adminUrl, redirectUri } )
				}
			>
				{ translate( 'Get Stats Commercial' ) }
			</Button>

			{
				// TODO: add - This is not commercial site box
			 }
		</>
	);
};

const StatsSingleItemPagePurchase = ( {
	siteSlug,
	planValue,
	currencyCode,
	redirectUri,
	from,
	siteId,
}: StatsSingleItemPagePurchaseProps ) => {
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	return (
		<StatsSingleItemPagePurchaseFrame>
			<StatsCommercialPurchase
				siteSlug={ siteSlug }
				planValue={ planValue }
				currencyCode={ currencyCode }
				adminUrl={ adminUrl || '' }
				redirectUri={ redirectUri }
				from={ from }
			/>
		</StatsSingleItemPagePurchaseFrame>
	);
};

export { StatsSingleItemPagePurchase };
