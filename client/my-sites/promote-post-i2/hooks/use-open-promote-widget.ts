import page from '@automattic/calypso-router';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordDSPEntryPoint, useDspOriginProps } from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from '../utils';
import useIsRunningInWpAdmin from './use-is-running-in-wpadmin';

export interface Props {
	keyValue: string;
	entrypoint: string;
	external?: boolean;
}

const useOpenPromoteWidget = ( { keyValue, entrypoint, external }: Props ) => {
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );
	const siteId = useSelector( getSelectedSiteId );
	const isRunningInWpAdmin = useIsRunningInWpAdmin();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const dspOriginProps = useDspOriginProps();
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const dispatch = useDispatch();

	const onOpenPromoteWidget = useCallback( () => {
		dispatch( recordDSPEntryPoint( entrypoint, dspOriginProps ) );
		if ( isRunningInWpAdmin ) {
			const blazeURL = getAdvertisingDashboardPath( `/posts/promote/${ keyValue }/${ siteSlug }` );

			if ( external ) {
				const { isAtomic } = dspOriginProps;
				const query = encodeURIComponent( `blazepress-widget=${ keyValue }` );
				window.location.href = isAtomic
					? `https://jetpack.com/redirect/?source=jetpack-blaze&site=${ siteSlug }&query=${ query }`
					: `${ siteAdminUrl }tools.php?page=advertising#!${ blazeURL }`;
			} else {
				page( blazeURL );
			}
		} else {
			openModal();
		}
	}, [
		siteSlug,
		entrypoint,
		keyValue,
		dspOriginProps,
		external,
		siteAdminUrl,
		isRunningInWpAdmin,
		openModal,
		dispatch,
	] );

	return onOpenPromoteWidget;
};

export default useOpenPromoteWidget;
