import { SelectorProduct } from '../types';
import './style.scss';

type Props = {
	product: SelectorProduct;
};

const ProductLightbox: React.FC< Props > = ( { product } ) => {
	return <div className="product-lightbox__main-wrapper">{ product.displayName }</div>;
};

export default ProductLightbox;
