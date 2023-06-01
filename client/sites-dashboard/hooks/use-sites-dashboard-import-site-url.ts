import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { TRACK_SOURCE_NAME } from '../utils';

export const useSitesDashboardImportSiteUrl = () => {
	const siteCount = useSelector( getCurrentUserSiteCount );

	return addQueryArgs(
		{
			source: TRACK_SOURCE_NAME,
			ref: siteCount === 0 ? 'calypso-nosites' : null,
		},
		'/start/import'
	);
};
