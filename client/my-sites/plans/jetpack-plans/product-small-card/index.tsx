import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import tempIcon from 'calypso/assets/images/illustrations/jetpack-search.svg';
import { ProductSmallCardProps } from '../types';

import './style.scss';

export const ProductSmallCard: React.FC< ProductSmallCardProps > = ( { item } ) => {
	const translate = useTranslate();

	const onMoreLinkClick = () => {
		// TO-DO - should display product lightbox
	};

	const onCheckoutClick = () => {
		// TO-DO - should redirect to correct checkout page
	};

	const productIcon = tempIcon; // TO-DO should be pulled from product data

	const { shortName: name, description } = item;

	return (
		<div className="product-small-card">
			<div className="product-small-card__icon">
				<img alt="" src={ productIcon } />
			</div>
			<div className="product-small-card__info">
				<div className="product-small-card__info-header">
					<h3 className="product-small-card__info-header-name">
						{ name }
						<span></span>
					</h3>
					<Button
						className="product-small-card__info-header-checkout"
						onClick={ onCheckoutClick }
						primary
						compact
					>
						{ translate( 'Get' ) }
					</Button>
				</div>
				<div className="product-small-card__info-content">
					{ description }
					<a
						className="product-small-card__info-more-link"
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
