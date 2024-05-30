import { useTranslate } from 'i18n-calypso';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import { useSelector } from 'calypso/state';
import SitesList from '../sites-list';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	sites: Array< SiteDetails | null | undefined >;
	selectedSite: SiteDetails;
	isLoading: boolean;
	plugin: PluginComponentProps;
}

export default function PluginAvailableOnSitesList( props: Props ) {
	const translate = useTranslate();

	const columns = [
		{
			key: 'site-name',
			header: translate( 'Site' ),
			colSpan: 2,
		},
		{ key: 'install' },
	];

	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, props.sites )
	);

	if ( ! sitesWithSecondarySites?.length ) {
		return null;
	}

	return (
		<div>
			<div className="plugin-details-v2__title">{ translate( 'Available on' ) }</div>
			<SitesList
				{ ...props }
				items={ sitesWithSecondarySites
					.map( ( site ) => site.site )
					.filter( ( site ) => site && ! site.is_deleted ) }
				columns={ columns }
			/>
		</div>
	);
}
