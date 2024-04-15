import { Button } from '@automattic/components';
import { useContext } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SitesOverviewContext from '../context';
import SiteBackupStaging from '../site-backup-staging';
import SiteSelectCheckbox from '../site-select-checkbox';
import SiteSetFavorite from '../site-set-favorite';
import { RowMetaData, SiteData } from '../types';
import { SiteHostInfo } from './site-host-info';

type Props = {
	rows: SiteData;
	metadata: RowMetaData;
	isLargeScreen?: boolean;
	isFavorite: boolean;
	siteError: boolean;
	hasAnyError: boolean;
};

export default function SiteNameColumn( {
	rows,
	metadata,
	isLargeScreen,
	isFavorite,
	hasAnyError,
}: Props ) {
	const dispatch = useDispatch();

	const { isBulkManagementActive } = useContext( SitesOverviewContext );

	const { link, isExternalLink, tooltip } = metadata;

	const siteId = rows.site.value.ID;
	const siteUrl = rows.site.value.URL;

	const handleSiteClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_site_link_click' ) );
	};

	return (
		<>
			{ isBulkManagementActive ? (
				<SiteSelectCheckbox
					isLargeScreen={ isLargeScreen }
					item={ rows }
					siteError={ hasAnyError }
					disabled={ rows.site.value.is_wpcom_atomic }
					tooltip={ tooltip }
				/>
			) : (
				<SiteSetFavorite
					isFavorite={ isFavorite }
					siteId={ rows.site.value.ID }
					siteUrl={ siteUrl }
				/>
			) }
			{ isLargeScreen ? (
				<Button
					className="sites-overview__row-text"
					borderless
					compact
					href={ link }
					target={ isExternalLink ? '_blank' : undefined }
					onClick={ handleSiteClick }
				>
					<SiteHostInfo isLargeScreen site={ rows.site.value } />
					{ siteUrl }
				</Button>
			) : (
				<>
					<span className="sites-overview__row-text">{ siteUrl }</span>
				</>
			) }
			<span className="sites-overview__overlay"></span>
		</>
	);
}
