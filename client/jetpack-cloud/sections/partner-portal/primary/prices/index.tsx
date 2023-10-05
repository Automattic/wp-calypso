import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import QueryProductsList from 'calypso/components/data/query-products-list';
import LicenseBundleCardDescription from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card-description';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import { useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getProductsList } from 'calypso/state/products-list/selectors';
import Layout from '../../layout';
import LayoutBody from '../../layout/body';
import LayoutHeader from '../../layout/header';
import LayoutTop from '../../layout/top';

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

		if ( userYearlyProduct === undefined ) {
			return null;
		}

		const dailyAgencyPrice = ( product.amount * 12 ) / 365;
		const dailyUserYearlyPrice = userYearlyProduct.cost / 365;

		const userMonthlyProduct =
			userYearlyProduct &&
			Object.values( userProducts ).find(
				( p ) =>
					p.billing_product_slug === userYearlyProduct.billing_product_slug &&
					p.product_term === 'month'
			);
		const dailyUserMonthlyPrice = userMonthlyProduct
			? ( userMonthlyProduct.cost * 12 ) / 365
			: undefined;

		return (
			<tr key={ product.product_id }>
				<td>
					<strong>{ product.name }</strong>
					<LicenseBundleCardDescription product={ product } />
				</td>
				<td>
					{ userMonthlyProduct && dailyUserMonthlyPrice && (
						<>
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
										price: formatCurrency( userMonthlyProduct.cost, 'USD', currencyFormatOptions ),
									},
								} ) }
							</div>
						</>
					) }
				</td>
				<td>
					<div className="prices__mobile-description">
						<div>{ translate( 'Jetpack.com Pricing' ) }</div>
						<span className="prices__th-detail">{ translate( 'billed yearly' ) }</span>
					</div>

					{ /* If monthly and yearly prices are equal we're going to assume there is no yearly plan
					  and hide the yearly price. Currently this is the case with the Jetpack AI Assistant product.
					  */ }
					{ userYearlyProduct.cost !== userMonthlyProduct?.cost && (
						<>
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
						</>
					) }

					{ userYearlyProduct.cost === userMonthlyProduct?.cost && <Gridicon icon="minus" /> }
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
		<Layout className="prices" title={ translate( 'Prices' ) } wide>
			<QueryProductsList type="jetpack" currency="USD" />

			<LayoutTop>
				<LayoutHeader>
					<CardHeading size={ 36 }>
						{ translate( 'Jetpack Agency & Pro Partner Program Product Pricing' ) }
					</CardHeading>

					<SelectPartnerKeyDropdown />
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="prices__description">
					<p>
						{ translate(
							'The following products are available through the Licenses section. Prices are calculated daily and invoiced at the beginning of the next month. Please note that Jetpack Manage prices will be displayed as a monthly cost. If you want to determine a yearly cost for the Agency/Pro pricing, you can take the daily cost x 365.'
						) }
					</p>
				</div>

				<table className="prices__table">
					<thead>
						<tr className="prices__head-row" style={ { backgroundColor: 'transparent' } }>
							<th colSpan={ 3 }></th>
							<th className="prices__column-highlight">
								<div className="prices__column-highlight-content">
									<Gridicon icon="star" size={ 18 } className="prices__column-highlight-icon" />
									<span className="prices__column-highlight-label">
										{ translate( 'Your Price' ) }
									</span>
								</div>
							</th>
						</tr>
						<tr className="prices__head-row">
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
			</LayoutBody>
		</Layout>
	);
}
