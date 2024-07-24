import { useInView } from 'react-intersection-observer';
import { SitesEllipsisMenu } from 'calypso/sites-dashboard/components/sites-ellipsis-menu';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteActionsProps {
	site: SiteExcerptData;
}

export const SiteActions = ( { site }: SiteActionsProps ) => {
	const { ref, inView } = useInView( { triggerOnce: true } );
	if ( site.is_deleted ) {
		return false;
	}

	return <div ref={ ref }>{ inView && <SitesEllipsisMenu site={ site } /> }</div>;
};
