import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { MoreInfoLinkProps } from '../types';

import './style.scss';

export const MoreInfoLink: React.FC< MoreInfoLinkProps > = ( { item, onClick, isExternal } ) => {
	const translate = useTranslate();

	const isExternalLink = isExternal && item.externalUrl;

	const href = isExternalLink ? item.externalUrl : `#${ item.productSlug }`;

	const target = isExternalLink ? '_blank' : undefined;

	return (
		<Button className="more-info-link" onClick={ onClick } href={ href } target={ target } plain>
			{ translate( 'More about {{productName/}}', {
				components: { productName: <>{ item.shortName }</> },
			} ) }

			{ isExternalLink && <Gridicon icon="external" size={ 16 } /> }
		</Button>
	);
};
