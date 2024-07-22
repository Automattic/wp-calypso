import { useInView } from 'react-intersection-observer';
import { SitesEllipsisMenu } from 'calypso/sites-dashboard/components/sites-ellipsis-menu';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteActionsProps {
	site: SiteExcerptData;
	size?: number;
}

export const SiteActions = ( { site, size }: SiteActionsProps ) => {
	const { ref, inView } = useInView( { triggerOnce: true } );
	if ( site.is_deleted ) {
		return false;
	}

	return <div ref={ ref }>{ inView && <SitesEllipsisMenu site={ site } size={ size } /> }</div>;
};
