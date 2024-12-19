import { useSelector } from 'calypso/state';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';

function useSiteTypes( siteId: number ) {
	const isJetpackNotAtomic = useSelector(
		( state ) => !! isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const isVip = useSelector(
		( state ) =>
			!! isVipSite( state as object, siteId as number ) ||
			!! getSiteOption( state, siteId, 'is_vip' )
	);

	return { isJetpackNotAtomic, isVip };
}

export default useSiteTypes;
