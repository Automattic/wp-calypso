import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { MoreInfoLinkProps } from '../types';

import './style.scss';

export const MoreInfoLink: React.FC< MoreInfoLinkProps > = ( {
	item,
	onClick,
	isExternal,
	externalLink,
} ) => {
	const translate = useTranslate();

	// TODO: Refactor the external link with indirect checkout logic.
	const isExternalLink = ( isExternal && item.externalUrl ) || !! externalLink;

	const href = isExternalLink ? externalLink || item.externalUrl : `#${ item.productSlug }`;

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
