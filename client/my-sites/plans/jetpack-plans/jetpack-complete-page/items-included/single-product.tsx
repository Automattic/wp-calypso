import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getProductIcon from '../../product-store/utils/get-product-icon';
import { SelectorProduct } from '../../types';
import './style.scss';
import { getProductUrl } from './utils';

type Props = {
	product: SelectorProduct;
};

const SingleProduct: React.FC< Props > = ( { product } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const onLinkClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_complete_page_single_product_open_link', {
				site_id: siteId,
				link: getProductUrl( product.productSlug ),
				product_slug: product.productSlug,
			} )
		);
	}, [ dispatch, siteId, product.productSlug ] );

	const onTooltipOpen = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_complete_page_single_product_open_tooltip', {
				site_id: siteId,
				product_slug: product.productSlug,
			} )
		);
	}, [ dispatch, siteId, product.productSlug ] );

	return (
		<div className="single-product__wrapper">
			<div className="single-product__icon">
				<img alt="" src={ getProductIcon( { productSlug: product.productSlug, light: false } ) } />
			</div>
			<div className="single-product__text">{ product.displayName }</div>
			<div className="single-product__info">
				<InfoPopover
					screenReaderText={ translate( 'Learn more' ) }
					position="right"
					onOpen={ onTooltipOpen }
				>
					<div className="single-product__info-popover-wrapper">
						{ product.shortDescription }
						<hr />
						<a
							className="single-product__info-link"
							href={ getProductUrl( product.productSlug ) }
							onClick={ onLinkClick }
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
