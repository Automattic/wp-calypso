import { PRODUCT_JETPACK_STATS_YEARLY } from '@automattic/calypso-products';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import StatsMain from 'calypso/my-sites/stats/components/stats-main';
import PageLoading from 'calypso/my-sites/stats/pages/shared/page-loading';
import {
	PLAN_CHOSEN_QUERY_ARG,
	PRICING_GRID_REFERRER,
} from 'calypso/my-sites/stats/pricing-grid/hooks/use-dismiss-pricing-grid';
import PricingGrid from 'calypso/my-sites/stats/pricing-grid/pricing-grid';
import { StatsSingleItemPagePurchaseFrame } from 'calypso/my-sites/stats/stats-purchase/stats-purchase-shared';
import { StatsCommercialPurchase } from 'calypso/my-sites/stats/stats-purchase/stats-purchase-single-item';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSiteSuffix, isOfflineMode, registerSite } from '../lib/jetpack-connection';
import getWpAdminUrl from '../lib/selectors/get-wp-admin-url';

const STATS_ADMIN_PATH = 'admin.php?page=stats';

/**
 * Where authorizing returns the visitor to. The marker tells the dashboard's pricing grid that the
 * plan question was already answered here — it cannot be recorded against the site at the time it
 * is asked, since the site has no blog id yet.
 *
 * `force_refresh` drops what the site cached while it had no connection. Everything Stats asked
 * for back then failed for want of a token, and those answers outlive the connection that fixes
 * them, so without this the dashboard greets a newly connected site with nothing in it.
 */
const AUTHORIZE_REDIRECT_URI = `${ STATS_ADMIN_PATH }&${ PLAN_CHOSEN_QUERY_ARG }=1&force_refresh=1`;

/**
 * The plan choice a site sees before it is connected to WordPress.com.
 *
 * Both plans start by registering the site, which is what gives WordPress.com a blog to attach
 * anything to. Registration leaves nobody signed in, so the free plan hands straight over to the
 * authorization flow, while the paid plan buys first and links the account on the way back — the
 * order Jetpack's own siteless checkout uses.
 */
export default function PreConnection() {
	const translate = useTranslate();
	const [ authorizeUrl, setAuthorizeUrl ] = useState< string | null >( null );
	const [ isRegistering, setIsRegistering ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const product = useSelector( ( state ) =>
		getProductBySlug( state, PRODUCT_JETPACK_STATS_YEARLY )
	);

	const connect = async () => {
		setError( null );
		setIsRegistering( true );

		try {
			return await registerSite( AUTHORIZE_REDIRECT_URI );
		} catch ( e ) {
			setError(
				( e as Error ).message ||
					String(
						translate( 'Jetpack could not connect this site to WordPress.com. Please try again.' )
					)
			);
			setIsRegistering( false );
			return null;
		}
	};

	const startForFree = async () => {
		const url = await connect();

		// Deliberately leaves the spinner up: the browser is on its way to WordPress.com.
		if ( url ) {
			window.location.href = url;
		}
	};

	const goToPurchase = async () => {
		const url = await connect();

		if ( url ) {
			setAuthorizeUrl( url );
			setIsRegistering( false );
		}
	};

	const renderStep = () => {
		if ( isOfflineMode() ) {
			return (
				<StatsMain fullWidthLayout>
					<Notice status="warning" isDismissible={ false }>
						{ translate(
							'This site is in offline mode, so it cannot be connected to WordPress.com. Stats will be available once the site is publicly reachable.'
						) }
					</Notice>
				</StatsMain>
			);
		}

		if ( authorizeUrl ) {
			return (
				<StatsMain fullWidthLayout>
					{ /* `stats-purchase-page` is the scope the purchase stylesheet defines its Jetpack
					     design tokens on. The site-scoped purchase route applies the same pair. */ }
					<div className="stats stats-purchase-page">
						<StatsSingleItemPagePurchaseFrame>
							<StatsCommercialPurchase
								siteId={ null }
								siteSlug={ getSiteSuffix() }
								planValue={ 0 }
								currencyCode={ product?.currency_code ?? 'USD' }
								adminUrl={ getWpAdminUrl() }
								redirectUri={ STATS_ADMIN_PATH }
								from={ PRICING_GRID_REFERRER }
								// Nobody is putting anything off here: this is the free plan, and taking it
								// still needs an account attached. Reaching this screen already registered
								// the site, so the URL to attach one is in hand.
								postponeLabel={ String( translate( 'Start for free' ) ) }
								onPostpone={ () => {
									window.location.href = authorizeUrl;
								} }
							/>
						</StatsSingleItemPagePurchaseFrame>
					</div>
				</StatsMain>
			);
		}

		if ( isRegistering ) {
			return PageLoading;
		}

		return <PricingGrid onSelectFree={ startForFree } onSelectPaid={ goToPurchase } />;
	};

	return (
		<>
			{ /* Mounted across every step: the tier slider reads the same product the grid prices,
			     and unmounting mid-flight would lose the response that populates it. */ }
			<QueryProductsList type="jetpack" />
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }
			{ renderStep() }
		</>
	);
}
