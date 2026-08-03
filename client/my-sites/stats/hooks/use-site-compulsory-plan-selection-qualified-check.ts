import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';

// Targeting new sites
export const isSiteNew = ( state: object, siteId: number | null ) => {
	const siteCreatedTimeStamp = getSiteOption( state, siteId, 'created_at' ) as string;

	return siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' );
};

export default function useSiteCompulsoryPlanSelectionQualifiedCheck( siteId: number | null ) {
	const isNewSite = useSelector( ( state ) => isSiteNew( state, siteId ) );

	return {
		isNewSite,
	};
}
