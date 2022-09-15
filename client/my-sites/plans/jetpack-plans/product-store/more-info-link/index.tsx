import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { EXTERNAL_PRODUCTS_LIST } from '../../constants';
import { MoreInfoLinkProps } from '../types';

import './style.scss';

export const MoreInfoLink: React.FC< MoreInfoLinkProps > = ( { item, onClick } ) => {
	const translate = useTranslate();

	const isExternalProductLink =
		EXTERNAL_PRODUCTS_LIST.includes( item.productSlug ) && item.externalUrl;

	const href = isExternalProductLink ? item.externalUrl : `#${ item.productSlug }`;

	const target = isExternalProductLink ? '_blank' : '_self';

	return (
		<Button className="more-info-link" onClick={ onClick } href={ href } target={ target } plain>
			{ translate( 'More about {{productName/}}', {
				components: { productName: <>{ item.shortName }</> },
			} ) }

			{ isExternalProductLink && <Gridicon icon="external" size={ 16 } /> }
		</Button>
	);
};
