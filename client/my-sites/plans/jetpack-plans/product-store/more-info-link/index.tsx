import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { MoreInfoLinkProps } from '../types';

import './style.scss';

export const MoreInfoLink: React.FC< MoreInfoLinkProps > = ( {
	item,
	onClick,
	isLinkExternal,
} ) => {
	const translate = useTranslate();

	// Open the link with new tab for `externalUrl` and `moreAboutUrl`.
	const isOpeningNewTab = isLinkExternal && ( item.externalUrl || item.moreAboutUrl );

	const href = isOpeningNewTab ? item.externalUrl || item.moreAboutUrl : `#${ item.productSlug }`;

	const target = isOpeningNewTab ? '_blank' : undefined;

	return (
		<Button className="more-info-link" onClick={ onClick } href={ href } target={ target } plain>
			{ translate( 'More about {{productName/}}', {
				components: { productName: <>{ item.shortName }</> },
			} ) }

			{ isOpeningNewTab && <Gridicon icon="external" size={ 16 } /> }
		</Button>
	);
};
