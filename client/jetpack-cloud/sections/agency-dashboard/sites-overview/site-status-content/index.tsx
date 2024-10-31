import ToggleActivateMonitoring from '../../downtime-monitoring/toggle-activate-monitoring';
import useRowMetadata from './hooks/use-row-metadata';
import SiteBoostColumn from './site-boost-column';
import SiteNameColumn from './site-name-column';
import SiteStatsColumn from './site-stats-column';
import SiteStatusColumn from './site-status-column';
import type { AllowedTypes, SiteData } from '../types';

interface Props {
	rows: SiteData;
	type: AllowedTypes;
	isLargeScreen?: boolean;
	isFavorite?: boolean;
	siteError: boolean;
}

export default function SiteStatusContent( {
	rows,
	type,
	isLargeScreen = false,
	isFavorite = false,
	siteError,
}: Props ) {
	const metadata = useRowMetadata( rows, type, isLargeScreen );
	const {
		row: { status },
		tooltip,
		tooltipId,
		siteDown,
	} = metadata;

	// Disable clicks/hover when there is a site error &
	// when the row is not monitor and monitor status is down
	// since monitor is clickable when site is down.
	const disabledStatus =
		siteError || ( type !== 'monitor' && siteDown ) || rows.site.value.is_simple;

	// Disable selection and toggle when there is a site error, site is down or site is simple provisioning
	const hasAnyError = !! ( siteError || siteDown || rows.site.value.is_simple );

	if ( type === 'site' ) {
		return (
			<SiteNameColumn
				rows={ rows }
				metadata={ metadata }
				isLargeScreen={ isLargeScreen }
				siteError={ siteError }
				isFavorite={ isFavorite }
				hasAnyError={ hasAnyError }
			/>
		);
	}

	// We will show "Site Down" when the site is down which is handled differently.
	if ( type === 'monitor' && ! siteDown ) {
		return (
			<ToggleActivateMonitoring
				site={ rows.site.value }
				settings={ rows.monitor.settings }
				status={ status }
				tooltip={ tooltip }
				tooltipId={ tooltipId }
				siteError={ hasAnyError }
				isLargeScreen={ isLargeScreen }
			/>
		);
	}

	if ( type === 'stats' ) {
		return (
			<SiteStatsColumn
				site={ rows.site.value }
				stats={ rows.stats.value }
				siteError={ hasAnyError }
			/>
		);
	}

	// We will show a progress icon when the site score is being fetched.
	if ( type === 'boost' && status !== 'progress' ) {
		return <SiteBoostColumn site={ rows.site.value } siteError={ hasAnyError } />;
	}

	return (
		<SiteStatusColumn
			type={ type }
			rows={ rows }
			metadata={ metadata }
			disabled={ disabledStatus }
		/>
	);
}
