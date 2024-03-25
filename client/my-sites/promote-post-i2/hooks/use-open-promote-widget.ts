import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordDSPEntryPoint, useDspOriginProps } from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from '../utils';

export interface Props {
	keyValue: string;
	entrypoint: string;
	external?: boolean;
}

const useOpenPromoteWidget = ( { keyValue, entrypoint, external }: Props ) => {
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const dspOriginProps = useDspOriginProps();
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const dispatch = useDispatch();

	const onOpenPromoteWidget = useCallback( () => {
		dispatch( recordDSPEntryPoint( entrypoint, dspOriginProps ) );
		if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
			const blazeURL = getAdvertisingDashboardPath( `/posts/promote/${ keyValue }/${ siteSlug }` );

			if ( external ) {
				window.location.href = `${ siteAdminUrl }tools.php?page=advertising#!${ blazeURL }`;
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
		openModal,
		dispatch,
	] );

	return onOpenPromoteWidget;
};

export default useOpenPromoteWidget;
