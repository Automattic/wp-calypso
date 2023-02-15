import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import getProductIcon from '../../product-store/utils/get-product-icon';
import { SelectorProduct } from '../../types';
import './style.scss';
import { getProductUrl } from './utils';

type Props = {
	product: SelectorProduct;
};

const SingleProduct: React.FC< Props > = ( { product } ) => {
	const translate = useTranslate();

	// console.log( { product } );

	return (
		<div className="single-product__wrapper">
			<div className="single-product__icon">
				<img alt="" src={ getProductIcon( { productSlug: product.productSlug, light: false } ) } />
			</div>
			<div className="single-product__text">{ product.displayName }</div>
			<div className="single-product__info">
				<InfoPopover screenReaderText={ translate( 'Learn more' ) } position="right">
					<div className="single-product__info-popover-wrapper">
						{ product.shortDescription }
						<hr />
						<a
							className="single-product__info-link"
							href={ getProductUrl( product.productSlug ) }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ translate( 'Learn more' ) + '...' }
						</a>
					</div>
				</InfoPopover>
			</div>
		</div>
	);
};

export default SingleProduct;
