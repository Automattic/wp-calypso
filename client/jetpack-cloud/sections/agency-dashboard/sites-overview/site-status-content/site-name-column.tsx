import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon, WordPressLogo } from '@automattic/components';
import classNames from 'classnames';
import { useContext } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SitesOverviewContext from '../context';
import SiteBackupStaging from '../site-backup-staging';
import SiteSelectCheckbox from '../site-select-checkbox';
import SiteSetFavorite from '../site-set-favorite';
import { RowMetaData, SiteData } from '../types';

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
	siteError,
	hasAnyError,
}: Props ) {
	const dispatch = useDispatch();

	const { isBulkManagementActive } = useContext( SitesOverviewContext );

	const { link, isExternalLink, tooltip } = metadata;

	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	const siteId = rows.site.value.blog_id;
	const siteUrl = rows.site.value.url;
	const isWPCOMAtomicSite = rows.site.value.is_atomic;

	// Site issues is the sum of scan threats and plugin updates
	let siteIssuesCount = rows.scan.threats + rows.plugin.updates;
	let isHighSeverityError = !! rows.scan.threats;
	if ( [ 'failed', 'warning' ].includes( rows.backup.status ) ) {
		siteIssuesCount = siteIssuesCount + 1;
		isHighSeverityError = isHighSeverityError || 'failed' === rows.backup.status;
	}
	if ( [ 'failed' ].includes( rows.monitor.status ) ) {
		siteIssuesCount = siteIssuesCount + 1;
		isHighSeverityError = true;
	}
	let errorContent;
	if ( siteError ) {
		errorContent = (
			<span className="sites-overview__status-critical">
				<Gridicon size={ 24 } icon="notice-outline" />
			</span>
		);
	} else if ( siteIssuesCount ) {
		errorContent = (
			<span
				className={ classNames(
					'sites-overview__status-count',
					isHighSeverityError ? 'sites-overview__status-failed' : 'sites-overview__status-warning'
				) }
			>
				{ siteIssuesCount }
			</span>
		);
	}

	const WPCOMHostedSiteBadgeColumn = isWPCOMAtomicSiteCreationEnabled && (
		<div className="fixed-host-column">
			<WordPressLogo
				className={ classNames( 'wordpress-logo', { 'is-visible': isWPCOMAtomicSite } ) }
				size={ 18 }
			/>
		</div>
	);

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
					disabled={ rows.site.value.is_atomic }
					tooltip={ tooltip }
				/>
			) : (
				<SiteSetFavorite
					isFavorite={ isFavorite }
					siteId={ rows.site.value.blog_id }
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
					{ WPCOMHostedSiteBadgeColumn }
					{ siteUrl }
					<SiteBackupStaging siteId={ siteId } />
				</Button>
			) : (
				<>
					<span className="sites-overview__row-text">
						{ WPCOMHostedSiteBadgeColumn }
						{ siteUrl } <SiteBackupStaging siteId={ siteId } />
					</span>
				</>
			) }
			<span className="sites-overview__overlay"></span>
			{ errorContent }
		</>
	);
}
