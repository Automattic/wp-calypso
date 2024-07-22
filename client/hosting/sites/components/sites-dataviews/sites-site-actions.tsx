import styled from '@emotion/styled';
import { useInView } from 'react-intersection-observer';
import { SitesEllipsisMenu } from 'calypso/sites-dashboard/components/sites-ellipsis-menu';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteActionsProps {
	site: SiteExcerptData;
}

const SiteActionsDiv = styled.div`
	flex: 1;
	justify-content: 'end';
`;

export const SiteActions = ( { site }: SiteActionsProps ) => {
	const { ref, inView } = useInView( { triggerOnce: true } );
	if ( site.is_deleted ) {
		return false;
	}

	return (
		<SiteActionsDiv ref={ ref }>{ inView && <SitesEllipsisMenu site={ site } /> }</SiteActionsDiv>
	);
};
