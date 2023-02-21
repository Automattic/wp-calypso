import { useIndividualProducts } from '../hooks/use-individual-peoducts';
import SingleProduct from './single-product';

const ItemsIncluded = () => {
	const products = useIndividualProducts();
	return (
		<ul className="items-included__list-table">
			{ products.map( ( product ) => (
				<li key={ product.productSlug }>
					<SingleProduct product={ product } />
				</li>
			) ) }
		</ul>
	);
};

export default ItemsIncluded;
