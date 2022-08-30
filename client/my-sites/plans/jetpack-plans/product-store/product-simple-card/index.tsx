import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ProductSimpleCardProps } from '../../types';
import useProductIcon from '../hooks/use-product-icon';

import './style.scss';

const ProductSimpleCard: React.FC< ProductSimpleCardProps > = ( { item } ) => {
	const translate = useTranslate();

	const onMoreLinkClick = () => {
		// TO-DO - should display product lightbox
	};

	const onCheckoutClick = () => {
		// TO-DO - should redirect to correct checkout page
	};

	const productIcon = useProductIcon( { productSlug: item.productSlug } );

	const { shortName: name, description } = item;

	return (
		<div className="product-simple-card">
			<div className="product-simple-card__icon">
				<img alt="" src={ productIcon } />
			</div>
			<div className="product-simple-card__info">
				<div className="product-simple-card__info-header">
					<h3 className="product-simple-card__info-header-name">
						{ name }
						<span></span>
					</h3>
					<Button
						className="product-simple-card__info-header-checkout"
						onClick={ onCheckoutClick }
						primary
						compact
					>
						{ translate( 'Get' ) }
					</Button>
				</div>
				<div className="product-simple-card__info-content">
					{ description }
					<a
						className="product-simple-card__info-more-link"
						onClick={ onMoreLinkClick }
						href="https://jetpack.com/for/agencies/"
						target="_blank"
						rel="noreferrer"
					>
						{ translate( 'More about %(name)s', { args: { name } } ) }
					</a>
				</div>
			</div>
		</div>
	);
};

export default ProductSimpleCard;
