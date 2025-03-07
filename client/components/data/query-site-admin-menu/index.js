import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';

export default function QuerySiteAdminMenu( { siteId } ) {
	const dispatch = useDispatch();
	const siteDomain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const locale = useLocale();

	useEffect( () => {
		siteId && dispatch( requestAdminMenu( siteId ) );
	}, [ dispatch, siteId, siteDomain, locale ] );

	return null;
}
