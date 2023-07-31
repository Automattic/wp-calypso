import config from '@automattic/calypso-config';
import page from 'page';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordDSPEntryPoint } from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from '../utils';

export interface Props {
	keyValue: string;
	entrypoint: string;
}

const useOpenPromoteWidget = ( { keyValue, entrypoint }: Props ) => {
	const { openModal } = useRouteModal( 'blazepress-widget', keyValue );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();

	const onOpenPromoteWidget = useCallback( () => {
		if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
			page( getAdvertisingDashboardPath( `/posts/promote/${ keyValue }/${ siteSlug }` ) );
		} else {
			openModal();
		}
		dispatch( recordDSPEntryPoint( entrypoint ) );
	}, [ siteSlug, entrypoint, keyValue, openModal, dispatch ] );

	return onOpenPromoteWidget;
};

export default useOpenPromoteWidget;
