import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import { MoreInfoLinkProps } from '../types';

import './style.scss';

export const MoreInfoLink: React.FC< MoreInfoLinkProps > = ( { item, onClick } ) => {
	const translate = useTranslate();

	const isExternalProduct = EXTERNAL_PRODUCTS_LIST.includes( item.productSlug );

	const href = isExternalProduct && item.externalUrl ? item.externalUrl : `#${ item.productSlug }`;

	return (
		<Button className="more-info-link" onClick={ onClick } href={ href } plain>
			{ translate( 'More about {{productName/}}', {
				components: { productName: <>{ item.shortName }</> },
			} ) }
		</Button>
	);
};
