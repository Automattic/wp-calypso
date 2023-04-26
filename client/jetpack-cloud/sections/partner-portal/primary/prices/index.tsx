import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import LicenseBundleCardDescription from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card-description';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getProductsList } from 'calypso/state/products-list/selectors';

import './style.scss';

export default function Prices() {
	const translate = useTranslate();
	const { data: agencyProducts } = useProductsQuery();
	const userProducts = useSelector( ( state ) => getProductsList( state ) );
	const currencyFormatOptions = { stripZeros: true };

	const productRows = agencyProducts?.map( ( product ) => {
		const userYearlyProduct = Object.values( userProducts ).find(
			( p ) => p.product_id === product.product_id
		);
		const userMonthlyProduct =
			userYearlyProduct &&
			Object.values( userProducts ).find(
				( p ) =>
					p.billing_product_slug === userYearlyProduct.billing_product_slug &&
					p.product_term === 'month'
			);

		const dailyAgencyPrice = ( product.amount * 12 ) / 365;
		const dailyUserMonthlyPrice = userMonthlyProduct ? ( userMonthlyProduct.cost * 12 ) / 365 : 0;
		const dailyUserYearlyPrice = userYearlyProduct ? userYearlyProduct.cost / 365 : 0;

		return (
			<tr key={ product.product_id }>
				<td>
					<strong>{ product.name }</strong>
					<LicenseBundleCardDescription product={ product } />
				</td>
				<td>
					<div className="prices__mobile-description">
						<div>{ translate( 'Jetpack.com Pricing' ) }</div>
						<span className="prices__th-detail">{ translate( 'billed monthly' ) }</span>
					</div>
					<div>
						{ translate( '%(price)s/day', {
							args: {
								price: formatCurrency( dailyUserMonthlyPrice, 'USD', currencyFormatOptions ),
							},
						} ) }
					</div>
					<div>
						{ translate( '%(price)s/month', {
							args: {
								price:
									userMonthlyProduct &&
									formatCurrency( userMonthlyProduct.cost, 'USD', currencyFormatOptions ),
							},
						} ) }
					</div>
				</td>
				<td>
					<div className="prices__mobile-description">
						<div>{ translate( 'Jetpack.com Pricing' ) }</div>
						<span className="prices__th-detail">{ translate( 'billed yearly' ) }</span>
					</div>
					<div>
						{ translate( '%(price)s/day', {
							args: {
								price: formatCurrency( dailyUserYearlyPrice, 'USD', currencyFormatOptions ),
							},
						} ) }
					</div>
					<div>
						{ translate( '%(price)s/year', {
							args: {
								price:
									userYearlyProduct &&
									formatCurrency( userYearlyProduct.cost, 'USD', currencyFormatOptions ),
							},
						} ) }
					</div>
				</td>
				<td>
					<div className="prices__mobile-description">
						<div>{ translate( 'Agency/Pro Pricing' ) }</div>
						<span className="prices__th-detail">{ translate( 'daily price' ) }</span>
					</div>
					{ translate( '%(price)s/day', {
						args: {
							price:
								dailyAgencyPrice &&
								formatCurrency( dailyAgencyPrice, 'USD', currencyFormatOptions ),
						},
					} ) }
				</td>
			</tr>
		);
	} );

	return (
		<Main wideLayout className="prices">
			<QueryProductsList type="jetpack" />

			<DocumentHead title={ translate( 'Prices' ) } />
			<SidebarNavigation />

			<div className="prices__header">
				<CardHeading size={ 36 }>
					{ translate( 'Jetpack Agency & Pro Partner Program Product Pricing' ) }
				</CardHeading>

				<SelectPartnerKeyDropdown />
			</div>

			<div className="prices__description">
				<p>
					{ translate(
						'The following products are available through the Licenses section. Prices are calculated daily and invoiced at the beginning of the next month. Please note that the Jetpack pro Dashboard prices will be displayed as a monthly cost. If you want to determine a yearly cost for the Agency/Pro pricing, you can take the daily cost x 365.'
					) }
				</p>
			</div>

			<table className="prices__table">
				<thead>
					<tr>
						<th></th>
						<th>
							<div>{ translate( 'Jetpack.com Pricing' ) }</div>
							<span className="prices__th-detail">{ translate( 'billed monthly' ) }</span>
						</th>
						<th>
							<div>{ translate( 'Jetpack.com Pricing' ) }</div>
							<span className="prices__th-detail">{ translate( 'billed yearly' ) }</span>
						</th>
						<th>
							<div>{ translate( 'Agency/Pro Pricing' ) }</div>
							<span className="prices__th-detail">{ translate( 'daily pricing' ) }</span>
						</th>
					</tr>
				</thead>
				<tbody>{ productRows }</tbody>
			</table>
		</Main>
	);
}
