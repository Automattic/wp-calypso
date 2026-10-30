import { useTranslate } from 'i18n-calypso';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import getTitanReferralDetails from '../../lib/get-titan-referral-details';
import ReferralTitanDetails from './referral-titan-details';
import type { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const getProductName = ( purchase: ReferralPurchase, data: APIProductFamilyProduct[] ) => {
	let productName = purchase.subscription?.product_name;

	if ( ! productName ) {
		const product = data?.find( ( product ) =>
			[ product.monthly_product_id, product.yearly_product_id, product.product_id ].includes(
				purchase.product_id
			)
		);
		productName = product?.name;
	}

	return productName;
};

/**
 * A referral holds one product per license, so repeats of a product share one
 * row with their count. A Titan purchase keeps its own row for its domain.
 */
const groupProducts = (
	products: ReferralPurchase[],
	productsData: APIProductFamilyProduct[]
): ReferralPurchase[][] => {
	const groups = new Map< number, ReferralPurchase[] >();
	const rows: ReferralPurchase[][] = [];
	products.forEach( ( product ) => {
		const group = groups.get( product.product_id );
		if ( getTitanReferralDetails( product, productsData ) ) {
			rows.push( [ product ] );
		} else if ( group ) {
			group.push( product );
		} else {
			const newGroup = [ product ];
			groups.set( product.product_id, newGroup );
			rows.push( newGroup );
		}
	} );
	return rows;
};

export default function ReferralProducts( {
	products,
	isFetchingProducts,
	productsData,
}: {
	products: ReferralPurchase[];
	isFetchingProducts: boolean;
	productsData: APIProductFamilyProduct[] | undefined;
} ) {
	const translate = useTranslate();

	if ( isFetchingProducts || ! productsData ) {
		return <TextPlaceholder />;
	}
	return (
		<div className="referral-products">
			{ groupProducts( products, productsData ).map( ( [ product, ...repeats ], index ) => {
				const productName = getProductName( product, productsData );
				return (
					<div key={ index } className="referral-products__product">
						<div className="referral-products__name">
							{ repeats.length && productName
								? translate( '%(productName)s x %(quantity)s', {
										args: { productName, quantity: repeats.length + 1 },
									} )
								: productName }
						</div>
						<ReferralTitanDetails product={ product } productsData={ productsData } />
					</div>
				);
			} ) }
		</div>
	);
}
