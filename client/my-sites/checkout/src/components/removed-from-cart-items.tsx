import type { ResponseCart } from '@automattic/shopping-cart';

export const RemovedFromCartItems = ( {
	responseCart: { restorable_products },
}: {
	responseCart: ResponseCart;
} ) => {
	console.debug( 'restorable_products', restorable_products );

	if ( ! restorable_products || restorable_products.length === 0 ) {
		return (
			<p>
				<b>NO RESTORABLE PRODUCTS YET</b>
			</p>
		);
	}

	return <ul className="removed-from-cart-items" />;
};
