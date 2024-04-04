import useRowMetadata from './hooks/use-row-metadata';
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

	// Disable selection and toggle when there is a site error or site is down
	const hasAnyError = !! siteError;

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

	if ( type === 'stats' ) {
		//TODO - figure out how to put in sparkline here
		return <SiteStatsColumn site={ rows.site.value } />;
	}

	return (
		<SiteStatusColumn
			type={ type }
			rows={ rows }
			metadata={ metadata }
		/>
	);
}
