import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

import './style.scss';

type Props = {
	item: SelectorProduct | null;
};

const ProductHeader: React.FC< Props > = ( { item } ) => {
	const translate = useTranslate();

	if ( item && item?.displayName && item?.lightboxDescription ) {
		return (
			<div className="product-header">
				<h1 className="product-header__heading">
					{ translate( 'Get Jetpack %(productName)s', {
						args: { productName: item.displayName },
					} ) }
				</h1>
				<p className="product-header__sub-heading">{ preventWidows( item.lightboxDescription ) }</p>
			</div>
		);
	}
	return null;
};

export default ProductHeader;
